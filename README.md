# Uzstagram 📸

Instagram-ga o'xshash O'zbek ijtimoiy tarmoq platformasi.

## Stack

- **Next.js 14** — App Router
- **TypeScript** — Type safety
- **PostgreSQL + Prisma** — Ma'lumotlar bazasi
- **NextAuth.js v5** — Autentifikatsiya
- **Cloudinary** — Rasm/video yuklash
- **Resend** — Email xabarnomalar
- **Tailwind CSS** — UI dizayn

## Imkoniyatlar

- ✅ Ro'yxatdan o'tish / Kirish (email + parol)
- ✅ Rasm va video yuklash (Cloudinary)
- ✅ Post yaratish (caption bilan)
- ✅ Like bosish (animatsiya bilan)
- ✅ Izoh yozish
- ✅ Follow / Unfollow
- ✅ Feed sahifasi (follow qilinganlar postlari)
- ✅ Explore sahifasi (qidiruv + mashhur postlar)
- ✅ Profil sahifasi
- ✅ Profil sozlamalari (ism, bio, avatar, website)
- ✅ Bildirishnomalar (like, comment, follow)
- ✅ Responsive dizayn (mobile + desktop)
- ✅ Dark mode qo'llab-quvvatlash

## O'rnatish

### 1. Talablar

- Node.js 18+
- PostgreSQL ma'lumotlar bazasi
- Cloudinary hisobi
- Resend API key

### 2. Loyihani yuklab olish

```bash
cd uzstagram
npm install
```

### 3. Environment variables

`.env.example` faylini nusxa oling:

```bash
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/uzstagram"
AUTH_SECRET="kamida-32-ta-belgi-uzunlikdagi-maxfiy-kalit"
NEXTAUTH_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="sizning-cloud-name"
CLOUDINARY_API_KEY="sizning-api-key"
CLOUDINARY_API_SECRET="sizning-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="sizning-cloud-name"

RESEND_API_KEY="re_xxxx"
EMAIL_FROM="Uzstagram <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database sozlash

```bash
npx prisma db push
npx prisma generate
```

### 5. Ishga tushirish

```bash
npm run dev
```

http://localhost:3000 da oching.

## Cloudinary sozlash

1. [cloudinary.com](https://cloudinary.com) da hisob oching
2. Dashboard da `Cloud Name`, `API Key`, `API Secret` ni oling
3. `.env` fayliga kiriting

## Resend sozlash

1. [resend.com](https://resend.com) da hisob oching
2. API key yarating
3. `.env` fayliga kiriting

## Loyiha strukturasi

```
src/
├── app/
│   ├── (auth)/          # Login, Register sahifalari
│   ├── (main)/          # Asosiy sahifalar (Feed, Explore, Profile)
│   └── api/             # API routelar
├── components/
│   ├── auth/            # Autentifikatsiya komponentlari
│   ├── layout/          # Sidebar, MobileNav
│   ├── post/            # PostCard, PostGrid, CreatePost
│   ├── profile/         # ProfileHeader, ProfileSettings
│   └── ui/              # UI komponentlari
├── lib/                 # Utility funksiyalar
├── hooks/               # Custom React hooks
└── types/               # TypeScript turlar
```

## Litsenziya

MIT
