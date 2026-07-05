# CS 1.6 Web Hub - İş Yoldaşları üçün Retro Portal

Bu layihə, iş kompyuterlərinə heç bir proqram, oyun klienti və ya server yükləmədən birbaşa brauzer üzərindən iş yoldaşlarınızla Counter-Strike 1.6 oynamaq üçün xüsusi olaraq hazırlanmışdır.

Portal vasitəsilə siz:
1. **Play-CS.com** və ya **CS-Online.club** üzərindən bir kliklə özəl oyun otaqları yaradıb linki iş yoldaşlarınızla paylaşa bilərsiniz.
2. Öz lokal `cstrike.zip` faylınızı brauzerə sürükləyib buraxaraq (drag-and-drop) oyunu birbaşa öz veb portalınızda işə sala bilərsiniz.

---

## 🚀 GitHub Pages-də Necə Yayımlamalı?

Bu portalı öz GitHub linkinizdə (`https://ulviabbasli.github.io/Cs/`) aktivləşdirmək üçün aşağıdakı addımları izləyin:

### Addım 1: GitHub-da Repository Yaradın
1. [GitHub](https://github.com/) profilinizə daxil olun.
2. Yeni **public** (ictimai) repository yaradın və adını `Cs` qoyun.

### Addım 2: Faylları Yükləyin (2 Metoddan Biri)

#### Metod A: Brauzer vasitəsilə (Heç bir proqram lazım deyil - Tövsiyə olunan)
1. GitHub-da indicə yaratdığınız `Cs` repository səhifəsinə daxil olun.
2. Səhifədə **"uploading an existing file"** və ya **"Add file" ➔ "Upload files"** düyməsini klikləyin.
3. Bu qovluqdakı `index.html`, `style.css`, `app.js` və `README.md` fayllarını seçib brauzerə sürükləyib buraxın.
4. Səhifənin aşağısında **"Commit changes"** düyməsini sıxın.

#### Metod B: Git Komandaları vasitəsilə (Əgər kompyuterdə Git varsa)
Lokal terminalda növbəti komandaları icra edin:
```bash
git init
git add .
git commit -m "First commit: CS 1.6 Web Hub"
git branch -M main
git remote add origin https://github.com/ulviabbasli/Cs.git
git push -u origin main
```

### Addım 3: GitHub Pages Aktivləşdirin
1. GitHub-da yaratdığınız `Cs` repository səhifəsində **Settings** (Ayarlar) menyusuna daxil olun.
2. Sol tərəfdəki paneldə **Pages** bölməsini seçin.
3. **Build and deployment** başlığı altında:
   - **Source**: `Deploy from a branch` seçin.
   - **Branch**: `main` və qovluq olaraq `/ (root)` təyin edin.
4. **Save** (Yadda saxla) düyməsini sıxın.

Təbrik edirik! 1-2 dəqiqə ərzində saytınız **`https://ulviabbasli.github.io/Cs/`** ünvanında aktiv olacaq. Bu linki iş yoldaşlarınıza göndərərək dərhal oynamağa başlaya bilərsiniz.

---

## 🎮 CS 1.6 Lokal Faylların Hazırlanması (`cstrike.zip`)

Brauzer klienti bölməsində öz oyununuzu açmaq üçün lokal CS 1.6 fayllarınızı ZIP şəklində hazırlamalısınız:
1. CS 1.6 quraşdırılmış qovluğa daxil olun.
2. Oradakı `cstrike` və `valve` qovluqlarını seçib birlikdə ZIP arxivinə əlavə edin.
3. Arxivin adını istənilən şəkildə qoya bilərsiniz (məsələn, `cstrike.zip`).
4. Portalın **"Browser Klient (WASM)"** bölməsinə keçib bu ZIP faylını sürükləyib buraxın və oyunu başladın.

---

## ℹ️ Layihə Haqqında
Bu portal HTML5, CSS3, Javascript, WebGL və WebAssembly texnologiyaları əsasında qurulmuşdur. Layihə tamamilə qeyri-kommersiya xarakterlidir və yalnız əyləncə məqsədi daşıyır.
