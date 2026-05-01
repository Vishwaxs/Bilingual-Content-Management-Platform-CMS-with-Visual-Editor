import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_CONTACT_PHONE = 'Contact via form';
const DEFAULT_CONTACT_EMAIL = 'info@abhm-up.org';

const readSettingValue = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const pickFirst = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (!value) continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return null;
};

export const useSiteSetting = (key: string) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      return data?.value ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTickerItems = () => {
  return useQuery({
    queryKey: ['settings', 'ticker_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'ticker_items')
        .maybeSingle();
      if (error) return [];
      const raw = data?.value;
      if (typeof raw === 'string') return raw.split('|').filter(Boolean);
      if (Array.isArray(raw)) return raw as string[];
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
};

export const usePublicContactInfo = () => {
  const nationalPhoneQuery = useSiteSetting('contact_phone_national');
  const legacyPhoneQuery = useSiteSetting('contact_phone');
  const emailQuery = useSiteSetting('contact_email');

  const phone = pickFirst(
    typeof nationalPhoneQuery.data === 'string' ? nationalPhoneQuery.data : null,
    typeof legacyPhoneQuery.data === 'string' ? legacyPhoneQuery.data : null,
    DEFAULT_CONTACT_PHONE,
  ) || DEFAULT_CONTACT_PHONE;

  return {
    phone,
    email: readSettingValue(emailQuery.data, DEFAULT_CONTACT_EMAIL),
    isLoading: nationalPhoneQuery.isLoading || legacyPhoneQuery.isLoading || emailQuery.isLoading,
  };
};

export const useLeadershipContactPhones = () => {
  const nationalPhoneQuery = useSiteSetting('contact_phone_national');
  const secretaryPhoneQuery = useSiteSetting('contact_phone_secretary');
  const officePhoneQuery = useSiteSetting('contact_phone_office');

  return {
    national: readSettingValue(nationalPhoneQuery.data, ''),
    secretary: readSettingValue(secretaryPhoneQuery.data, ''),
    office: readSettingValue(officePhoneQuery.data, ''),
    isLoading: nationalPhoneQuery.isLoading || secretaryPhoneQuery.isLoading || officePhoneQuery.isLoading,
  };
};
