import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getClientAddress, rateLimit } from '../_shared/rate-limit.ts';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg','image/png','image/webp','image/gif']);
const ALLOWED_DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5MB
const MAX_DOC_SIZE = 25 * 1024 * 1024;    // 25MB

Deno.serve(async (req) => {
  try {
    const cors = handleCors(req);
    if (cors) return cors;

    if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse(req, { error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse(req, { error: 'Unauthorized' }, 401);

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'editor'])
      .limit(1)
      .maybeSingle();

    if (!roleData?.role) {
      return jsonResponse(req, { error: 'Forbidden: Editor role required' }, 403);
    }

    const clientIp = getClientAddress(req);
    const rl = await rateLimit(`upload:${user.id}:${clientIp}`, 20, 60);
    if (!rl.allowed) return jsonResponse(req, { error: 'Too many uploads. Please wait.' }, 429);

    const url = new URL(req.url);
    const bucketParam = url.searchParams.get('bucket') ?? '';
    const VALID_BUCKETS = ['news-images', 'event-images', 'leader-photos', 'documents', 'media'];
    if (!VALID_BUCKETS.includes(bucketParam)) {
      return jsonResponse(req, { error: 'Invalid bucket' }, 400);
    }

    const isDocument = bucketParam === 'documents';
    const allowedTypes = isDocument ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isDocument ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;

    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > maxSize) {
      return jsonResponse(req, { error: `File too large. Maximum: ${maxSize / 1024 / 1024}MB` }, 413);
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return jsonResponse(req, { error: 'No file provided' }, 400);

    if (!allowedTypes.has(file.type)) {
      return jsonResponse(req, { error: 'Invalid file type' }, 422);
    }

    if (file.size > maxSize) {
      return jsonResponse(req, { error: `File too large. Maximum: ${maxSize / 1024 / 1024}MB` }, 413);
    }

    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > maxSize) {
      return jsonResponse(req, { error: `File too large. Maximum: ${maxSize / 1024 / 1024}MB` }, 413);
    }

    const ext = MIME_EXTENSION[file.type] ?? 'bin';
    const safeFilename = `${crypto.randomUUID()}.${ext}`;

    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from(bucketParam)
      .upload(safeFilename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return jsonResponse(req, { error: 'Upload failed' }, 500);
    }

    const { data: { publicUrl } } = adminSupabase.storage.from(bucketParam).getPublicUrl(safeFilename);

    await adminSupabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'create',
      entity_type: 'file_upload',
      entity_id: uploadData.path,
      details: { filename: file.name, bucket: bucketParam, size: buffer.byteLength },
    });

    return jsonResponse(req, { url: publicUrl, path: uploadData.path, size: buffer.byteLength });
  } catch (error) {
    console.error('Unhandled upload error:', error);
    return jsonResponse(req, { error: 'Unexpected server error' }, 500);
  }
});
