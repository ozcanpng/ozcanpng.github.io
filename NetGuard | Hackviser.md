# NetGuard | Hackviser

![image](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-30%2001.01.20.png)

  

Bu yazıda, **Nmap** taramasıyla başlayan ve sonrasında **FTP**, **NFS** servisleri ile **Textpattern CMS** üzerinden **root** yetkisine kadar ilerleyen adım‑adım süreci anlatıyorum.

  

---

  

## 1. Nmap ve Dirsearch Çıktılarının Analizi

  

```python

  

21/tcp FTP (vsftpd 3.0.3) – anonim giriş açık, PDF dosyası mevcut

  

22/tcp SSH (OpenSSH 8.4p1)

  

80/tcp HTTP (Apache) – Textpattern CMS

  

111/tcp rpcbind (NFS & RPC servisleri)

  

2049/tcp NFS (v3–4) – paylaşılan dizin mount edilebilir

  

3306/tcp MySQL 8.0.36

  

```

  

![Nmap Çıktısı](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.18.44.png)

  
  

Dirsearch taramasında da **Textpattern CMS** dizinini doğruladık:

  

![Dirsearch Çıktısı](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.19.00.png)

  

> **Not:** CMS’ye daha sonra döneceğiz.

  

---

  

## 2. FTP Sunucusuna Anonim Giriş

  

Anonim kullanıcı ile bağlanıp iki PDF dosyasını indirdik:

  

- `firewall-default-configuration.pdf`

- `firewall-documentation.pdf`

  

![FTP İndirme](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.08.29.png)

  

---

  

## 3. Varsayılan Firewall Kimlik Bilgileri

  

`firewall-default-configuration.pdf` içinde “_Firewall kurulumu için kullanılan varsayılan kullanıcı adı/şifre nedir?_” sorusunun cevabı bulunuyor.

  

![PDF İncelemesi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2023.10.50.png)

  

---

  

## 4. Blog Yazarı Bilgisi

  

Sitedeki **Author** alanından “_Blog gönderilerini yazan yazar kimdir?_” sorusunun cevabını aldık: **Arthur**.

  

![Yazar Bilgisi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2023.11.14.png)

  

---

  

## 5. NFS Paylaşımlarını Keşfetmek

  

Nmap çıktısı, NFS paylaşımlarını gösteriyordu. Mount edip içerik kontrolü yaptık:

  

![NFS Mount](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.09.03.png)

  

---

  

## 6. Site Yedeğini İndirmek

  

Paylaşılan dizinde `site-backup.zip` bulduk ve çıkardık:

  

![Yedek Dosyalar](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.11.28.png)

  

---

  

## 7. Veritabanı Kimlik Bilgilerini Bulmak

  

Yedekteki `textpattern/config.php` dosyasında **database** erişim bilgileri yer alıyordu. Böylece “_Web sitesinin MySQL veritabanına erişim için kullandığı kullanıcı adı/şifre nedir?_” sorusunu da yanıtladık.

  

![config.php](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.12.14.png)

  

---

  

## 8. MySQL’e Bağlanmak

  

Elde ettiğimiz kimlik bilgileriyle veritabanına giriş yaptık:

  

![MySQL Bağlantısı](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.13.56.png)

  

---

  

## 9‑10. Tabloları İncelemek

  

`textpattern` veritabanındaki tabloları listelerken `txp_users` özellikle dikkat çekiciydi:

  

![txp_users Tablosu](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.14.49.png)

  

Burada **bcrypt** ile hashlenmiş parola ve Arnold’ın e‑posta adresini bulduk.

  

---

  

## 11‑14. Parolayı Güncelleyerek CMS’ye Sızmak

  

Hash’i kırmak yerine, kendi oluşturduğumuz bcrypt hash’i ile **admin** parolasını güncelledik:

  

![bcrypt Hash](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.19.22.png)

  

![UPDATE Sorgusu](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.21.32.png)

  

Ardından **Textpattern** arayüzüne `textpattern:admin` ile giriş yaptık:

  

![Textpattern Girişi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.21.52.png)

  

![Panel Görünümü](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.22.02.png)

  

---

  

## 15‑19. Reverse Shell Yüklemek

  

Paneldeki **Upload** bölümüne, revshells.com’dan düzenlediğim PHP reverse shell dosyasını yükledim. Dirsearch çıktısında gördüğümüz `/files/` dizinine yüklenen dosyayı doğruladım ve dinleyici (listener) açarak shell’i tetikledim.

  

![Reverse Shell Yükleme](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.23.16.png)

  

![Yüklenen Dosya](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.34.05.png)

  

![Listener](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.34.14.png)

  

Sonuç: **www‑data** kullanıcısı ile başarılı bağlantı.

  

---

  

## 20‑24. Cron Yetki Yükseltmesi ile Root

  

Çalışan dizinde iki ilginç dosya fark ettim:

  

![İlginç Dosyalar](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.36.53.png)

  

`system_status_report.sh` dosyasının her dakika **root** yetkisiyle çalıştığını, ayrıca başka bir `.sh` betiğini çağırdığını gördüm. `system_status.log` dosyasının içeriğini değiştirebildiğim için, içine reverse shell komutu ekledim:

  

![Log Değişikliği](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.48.32.png)

  

Dinleyiciye geri döndüğümde **root** yetkisiyle shell elde ettim:

  

![Root Shell](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.49.16.png)

  

---

  

## 25. Son Flag’ler

  

Son olarak `/project` dizinine gidip kalan iki flag’i topladım:

  

1. **“Firewall’ın dijital imzası nedir?”**

  

2. **“Firewall’a, administrator erişimi olan kişinin kullanıcı adı nedir?”**

  

![Project Dizini](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-06-29%2022.50.37.png)

  

---

  

## Sonuç

  

Zor olan bu senaryoda, başlangıçtaki temel port taramasından yola çıkarak FTP, NFS ve CMS zafiyetlerini zincir şeklinde kullanıp tam yetki (root) elde ettik. Adımların her biri, gerçek dünyadaki saldırı yüzeylerini anlamak açısından öğreticiydi. Umarım bu write‑up hem CTF çözenlere hem de sistemlerini güvence altına almak isteyenlere fayda sağlar.
