# Apache Tomcat 8.5.19 – CVE-2017-12617 Exploitation

## 1) Nmap Scan Report

![Nmap Scan](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2014.53.02.png)

---

## 2) Port 8080 – Apache Tomcat 8.5.19

Port 8080 üzerinde çalışan Apache Tomcat servisini ziyaret ediyoruz.

![Apache Tomcat](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2014.53.23%201.png)

---

## 3) Directory Scan

Olası alt dizinleri görmek için directory scan gerçekleştiriyoruz.

![Directory Scan](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2015.01.49.png)

---

## 4) Zafiyet Tespiti – CVE-2017-12617

Apache Tomcat 8.5.19 sürümünde, `readonly` parametresinin `false` olarak ayarlandığı durumlarda geçerli olan **CVE-2017-12617** zafiyeti bulunduğunu görüyoruz.

![Zafiyet Bilgisi](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2015.08.47.png)

---

## 5) Metasploit Framework

Bu zafiyet için Metasploit içerisinde hazır bir exploit bulunmaktadır.

![Metasploit](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2015.10.26.png)

---

## 6) Manuel Exploit – JSP Reverse Shell

Ben bu zafiyeti manuel olarak sömürmeyi ve `PUT` metodu ile `.jsp` uzantılı bir reverse shell dosyası yüklemeyi tercih ettim.

![PUT Shell](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2015.12.31.png)

---

## 7) Shell Erişimi

İsteği gönderdikten sonra bir listener kurup `http://172.20.2.57:8080/shell.jsp` adresine gidiyoruz ve başarıyla shell erişimini sağlıyoruz.

![Shell Access](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2015.31.47.png)

---

## 8) Konfigürasyon Teyidi

Zafiyetin nedeni olan `readonly` parametresinin `false` olarak ayarlandığını aşağıdaki komutla teyit ediyoruz:

```bash
grep -Ri -A1 '<param-name>readonly</param-name>' /usr/local/tomcat | grep -i '<param-value>false</param-value>' -B1
```

---

## 9) Bash Script ile Doğrulama

Bütün `tomcat` dizinini tarayıp aradığımız parametreleri gösteren küçük bir bash scripti ile bulgularımızı doğruluyoruz.

![Config Doğrulama](https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/Ekran%20Resmi%202025-07-04%2014.51.18.png)
