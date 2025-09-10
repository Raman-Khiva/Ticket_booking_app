import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

const QRCodeDisplay = ({ value, size = 200, title = "Event Ticket" }: QRCodeDisplayProps) => {
  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg text-card-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-background rounded-lg">
          <QRCodeSVG
            value={value}
            size={size}
            level="H"
            includeMargin={true}
            fgColor="#1e293b"
            bgColor="#ffffff"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-[200px] break-all">
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;