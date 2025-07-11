# Overpass | TryHackMe

## 1) Nmap Servis Taraması

Hedef sistemde açık portları tespit etmek için `nmap` taraması gerçekleştirildi.

![Nmap](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Nmap.png)

---

## 2) Dirsearch ile Dizin Keşfi

Port 80 üzerinde çalışan HTTP servisine yönelik directory search yapıldı ve bazı önemli directory'ler bulundu.

![Dirsearch](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Dirsearch.png)

---

## 3) Admin Giriş Paneli

Tarama sonucunda `/admin` paneline ulaşıldı.

![Admin Paneli](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/adminPanel.png)

---

## 4) JavaScript Analizi

Directory search sonucunda gördüğümüz main.js dosyasında `SessionToken` cookie’si set edildiğinde kullanıcı doğrulaması yapılmadan admin paneline erişim sağlanabildiği tespit edildi.

![JS Analizi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/LoginBypassMethod.png)

---

## 5) Cookie ile Giriş Bypass

Tarayıcı konsolundan `SessionToken` cookie'si set edilerek yetkisiz giriş sağlandı.

![Cookie Bypass](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/LoginPanelCookieSet.png)

---

## 6) SSH Anahtarının Ele Geçirilmesi

Admin panelinde James'e ait parolayla şifrelenmiş bir SSH private key paylaşılmıştır ve Anahtarın AES-128-CBC ile şifrelendiği bilgisi yer almaktadır.

![SSH Key](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/sshKey.png)

---

## 7) ssh2john.py ile Hash’e Çevirme

SSH anahtarı `ssh2john.py` scripti ile John the Ripper için hash formatına dönüştürüldü.

![Hash Formatına Çevirme](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/sshKeyToHashTxt.png)

---

## 8) John the Ripper ile Kırma

Rockyou wordlist'i kullanılarak parola başarılı şekilde kırıldı: `james13`

![Hash Crack](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/HashCracked.png)

---

## 9) SSH ile Bağlantı

Parola ile birlikte özel anahtar kullanılarak James kullanıcısı ile sunucuya SSH bağlantısı sağlandı.

![SSH Giriş](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/successToLogin.png)

---

## 10) User Flag

James kullanıcısının home dizininde `user.txt` dosyası bulundu.

```txt
thm{65c1aaf000506e56996822c6281e6bf7}
```

![User Flag](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/userFlag.png)

---

## 11) Crontab Analizi

Crontab'lara bakıldığında root yetkisinde her dakika çalışan bir komut olduğu tespit edildi.

```python
* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```

---

## 12) Hostname ve Alan Adı Bilgisi

Sonrasında `/etc/hosts` dosyası incelenerek hedef sistemin local domain ismi öğrenildi: `overpass.thm`

Bu noktada `Privilege Escalation` yapılabilmesinin yolu bu komuta bir şekilde müdahalede bulunmaktır.

![Crontab Keşfi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Crontab.png)

---

## 13) İstek Yönlendirme

`/etc/hosts` dosyasının `james` kullanıcısı tarafından yazılabilir olduğu tespit edildi. Bu durumdan yararlanılarak, hedef alan adı kendi IP adresimize yönlendirilip zararlı betiğin tetiklenmesi amaçlandı.

![](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/privEscTactics.png)
 
HTTP sunucusu başlatılarak hedefin dosya isteğini kendi IP adresimize yapması sağlandı. 

![](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/rootListener.png)

---

## 14) Root Shell Elde Edilmesi

1 dakikanın sonunda root haklarıyla reverse shell bağlantısı elde edilmiştir.

![Root Shell](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/rootFlag.png)

---

## 15) Root Flag

Root yetkisiyle `root.txt` dosyası okunarak son bayrak elde edilmiştir.

```txt
thm{7f336f8c359dbac18d54fdd64ea753bb}
```

---

Tüm adımlar başarıyla tamamlandı ve hedef sisteme tam kontrol sağlandı.
