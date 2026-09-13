# Deploy Printer Service trong LAN

Tài liệu này dành cho một máy tính trong mạng LAN có kết nối trực tiếp đến printer. App chạy HTTPS bằng certificate do `mkcert` ký, và được quản lý bằng PM2.

## Mô hình

- Máy chạy app: máy tính nối được printer qua USB, Wi-Fi, hoặc LAN.
- IP LAN ví dụ: `192.168.1.124`.
- Hostname nội bộ nên dùng cố định, ví dụ: `node.printer.local`.
- Devices khác trong LAN như laptop, iPhone, iPad gọi API qua HTTPS:

```txt
https://node.printer.local:1340
```

Hoặc nếu chưa có DNS nội bộ:

```txt
https://192.168.1.124:1340
```

Nên dùng hostname cố định thay vì IP để sau này đổi IP đỡ phải cài lại cấu hình.

## 1. Chuẩn bị máy chạy printer

Cài Node.js, npm, PM2 và mkcert.

macOS:

```bash
brew install mkcert nss
npm install -g pm2
```

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y nodejs npm libnss3-tools
sudo npm install -g pm2
```

Nếu dùng Ubuntu và cần bản Node mới hơn, cài Node qua NodeSource hoặc `nvm` trước rồi mới cài PM2.

## 2. Clone hoặc cập nhật source

Trên máy chạy printer:

```bash
git clone git@github.com:zombiearnie88/rubik_printer_dev.git printer
cd printer
npm install
```

Nếu repo đã có sẵn:

```bash
cd /path/to/printer
git pull origin main
npm install
```

## 3. Thiết lập hostname trong LAN

Chọn một hostname ổn định, ví dụ:

```txt
node.printer.local
```

Cách tốt nhất là cấu hình trong router/local DNS:

```txt
node.printer.local -> 192.168.1.124
```

Nếu router không hỗ trợ local DNS, có thể tạm dùng IP trực tiếp. Khi đó IP phải nằm trong certificate SAN.

## 4. Tạo certificate bằng mkcert

Cài local root CA trên máy tạo certificate:

```bash
mkcert -install
```

Tạo server certificate:

```bash
npm run cert:renew
```

Script này hiện tạo certificate cho:

```txt
node.printer.local
localhost
192.168.1.124
127.0.0.1
::1
```

Kiểm tra hạn certificate:

```bash
npm run cert:check
```

Nếu đổi hostname hoặc IP, cập nhật script `cert:renew` trong `package.json`, rồi chạy lại:

```bash
npm run cert:renew
```

## 5. Cài root CA lên iPhone/iPad một lần

Lấy thư mục root CA:

```bash
mkcert -CAROOT
```

Trong thư mục đó có file:

```txt
rootCA.pem
```

Gửi file `rootCA.pem` sang iPhone/iPad, ví dụ AirDrop, email nội bộ, hoặc một link file tạm trong LAN.

Trên iPhone/iPad:

1. Mở file `rootCA.pem` để cài profile.
2. Vào `Settings -> General -> VPN & Device Management` để install profile nếu iOS yêu cầu.
3. Vào `Settings -> General -> About -> Certificate Trust Settings`.
4. Bật full trust cho root CA của `mkcert`.

Sau bước này, iPhone/iPad sẽ trust các server certificate mới được ký bởi cùng root CA đó. Khi cert server hết hạn, chỉ cần renew trên máy chạy printer, không cần cài lại cert trên iPhone/iPad.

## 6. Build app

```bash
npm run build
```

Build tạo output trong:

```txt
dist/
```

Nếu đang dùng repo deploy riêng `rubik_printer_dist`, script build cũng copy artifact sang:

```txt
../dist/printer
```

## 7. Chạy app bằng PM2

Chạy lần đầu:

```bash
NODE_ENV=development pm2 start dist/main.js --name rubik-printer
```

App development mặc định listen port `1340`.

Nếu muốn chạy production:

```bash
NODE_ENV=production PORT=1339 pm2 start dist/main.js --name rubik-printer
```

Xem trạng thái:

```bash
pm2 status
pm2 logs rubik-printer
```

Cho PM2 tự chạy lại sau reboot:

```bash
pm2 save
pm2 startup
```

Lệnh `pm2 startup` sẽ in ra một lệnh `sudo ...`; copy và chạy đúng lệnh đó, rồi chạy lại:

```bash
pm2 save
```

## 8. Test từ device trong LAN

Từ laptop hoặc điện thoại trong cùng Wi-Fi:

```txt
https://node.printer.local:1340/printers
```

Hoặc:

```txt
https://192.168.1.124:1340/printers
```

Nếu browser báo certificate không trust trên iPhone/iPad, kiểm tra lại:

- Đã cài `rootCA.pem`, không phải `cert/cert.pem`.
- Đã bật full trust trong `Certificate Trust Settings`.
- URL đang gọi nằm trong certificate SAN.
- IP máy chạy printer chưa đổi.

## 9. Renew certificate

Khi certificate gần hết hạn:

```bash
cd /path/to/printer
npm run cert:renew
npm run cert:check
npm run build
pm2 restart rubik-printer
```

Nếu vẫn dùng cùng root CA, iPhone/iPad không cần cài lại certificate.

## 10. Deploy update code

Trên máy chạy printer:

```bash
cd /path/to/printer
git pull origin main
npm install
npm run build
pm2 restart rubik-printer
pm2 logs rubik-printer
```

Nếu deploy qua repo artifact `rubik_printer_dist`, trên máy build:

```bash
cd /Users/thachduong/dev/rubik/printer
npm run build

cd /Users/thachduong/dev/rubik/dist/printer
git add .
git commit -m "deploy printer service"
git push origin main
```

Rồi trên máy chạy printer:

```bash
cd /path/to/rubik_printer_dist
git pull origin main
npm install --omit=dev
pm2 restart rubik-printer
```

## 11. Firewall

Đảm bảo máy chạy printer cho phép các device trong LAN truy cập port app.

macOS:

- Vào `System Settings -> Network -> Firewall`.
- Cho phép Node.js nhận incoming connections.

Ubuntu:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 1340 proto tcp
```

Đổi subnet nếu LAN không phải `192.168.1.0/24`.

## 12. Ghi chú bảo mật

- Chỉ expose service này trong LAN.
- Không mở port ra internet nếu không có authentication.
- Không commit private key nếu repo public.
- Nếu root CA bị lộ, tạo root CA mới và cài lại trên devices.
