export function generateQRCodeURL(tableNumber: number, restaurantName: string): string {
  // Convert restaurant name to URL-friendly format
  const restaurantSlug = restaurantName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // In a real implementation, this would use environment variables
  // For demo purposes, we'll use a placeholder domain
  const baseUrl = process.env.VITE_APP_URL || 'https://splitbill.app';
  
  return `${baseUrl}/bill/${tableNumber}/${restaurantSlug}`;
}

export function generateQRCodeDataURL(url: string): string {
  // This would integrate with a real QR code generation library like 'qrcode'
  // For now, return a placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12">
        QR Code for: ${url}
      </text>
    </svg>
  `)}`;
}
