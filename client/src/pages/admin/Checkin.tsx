import QRScanner from '@/components/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle, Users, Clock } from 'lucide-react';

const AdminCheckin = () => {
  // Mock check-in statistics
  const checkInStats = {
    totalScanned: 45,
    validTickets: 42,
    invalidTickets: 3,
    recentScans: [
      { id: 'TKT001-TECH-2024-USER1', status: 'valid', time: '2024-03-15 14:30' },
      { id: 'TKT002-MUSIC-2024-USER1', status: 'valid', time: '2024-03-15 14:28' },
      { id: 'INVALID-TICKET-CODE', status: 'invalid', time: '2024-03-15 14:25' },
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Event Check-in</h1>
        <p className="text-muted-foreground">
          Scan QR codes to validate tickets and check in attendees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">QR Code Scanner</h2>
          <QRScanner />
        </div>

        {/* Statistics and Recent Activity */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scanned</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkInStats.totalScanned}</div>
                <p className="text-xs text-muted-foreground">Tickets processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valid Entries</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{checkInStats.validTickets}</div>
                <p className="text-xs text-muted-foreground">Successfully checked in</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invalid Tickets</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{checkInStats.invalidTickets}</div>
                <p className="text-xs text-muted-foreground">Rejected entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((checkInStats.validTickets / checkInStats.totalScanned) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Valid ticket rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checkInStats.recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-mono text-sm">{scan.id}</p>
                      <p className="text-xs text-muted-foreground">{scan.time}</p>
                    </div>
                    <Badge 
                      variant={scan.status === 'valid' ? 'default' : 'destructive'}
                      className={scan.status === 'valid' ? 'bg-success text-success-foreground' : ''}
                    >
                      {scan.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCheckin;