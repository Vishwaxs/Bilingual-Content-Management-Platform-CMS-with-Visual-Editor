import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground font-body">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold font-display text-foreground">{value}</div>
    </CardContent>
  </Card>
);

export default StatsCard;
