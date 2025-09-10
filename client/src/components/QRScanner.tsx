import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ScanResult {
  code: string;
  isValid: boolean;
  message: string;
}

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Mock QR validation function
  const validateTicket = (code: string): ScanResult => {
    // This would normally connect to your backend
    const validCodes = ['TKT001-TECH-2024-USER1', 'TKT002-MUSIC-2024-USER1'];
    
    if (validCodes.includes(code)) {
      return {
        code,
        isValid: true,
        message: 'Valid ticket - Entry granted'
      };
    } else {
      return {
        code,
        isValid: false,
        message: 'Invalid ticket code'
      };
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      const result = validateTicket(manualCode.trim());
      setScanResult(result);
      setManualCode('');
    }
  };

  const handleCameraScan = () => {
    // Mock camera scanning
    setIsScanning(true);
    
    // Simulate scan result after 2 seconds
    setTimeout(() => {
      const mockScannedCode = 'TKT001-TECH-2024-USER1';
      const result = validateTicket(mockScannedCode);
      setScanResult(result);
      setIsScanning(false);
    }, 2000);
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(false);
    setManualCode('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>QR Code Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning && !scanResult && (
            <>
              <Button 
                onClick={handleCameraScan}
                className="w-full"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scan
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Enter ticket code manually"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                />
                <Button 
                  onClick={handleManualScan}
                  variant="outline"
                  className="w-full"
                  disabled={!manualCode.trim()}
                >
                  Validate Code
                </Button>
              </div>
            </>
          )}

          {isScanning && (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Scanning...</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsScanning(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {scanResult && (
            <div className="text-center space-y-4">
              <div className={`p-4 rounded-lg ${
                scanResult.isValid ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {scanResult.isValid ? (
                  <CheckCircle className="h-12 w-12 mx-auto text-success mb-2" />
                ) : (
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
                )}
                <Badge 
                  className={scanResult.isValid ? 
                    'bg-success text-success-foreground' : 
                    'bg-destructive text-destructive-foreground'
                  }
                >
                  {scanResult.message}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {scanResult.code}
                </p>
              </div>
              <Button onClick={resetScanner} variant="outline">
                Scan Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;