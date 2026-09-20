# PassProve — správa registrací

Menší administrační varianta v Next.js a Supabase zaměřená na registrace.

**Stav:** Starší nebo souběžná varianta PassProve uchovaná jako reference; nejde o označení hlavní produkční verze.

## Co projekt obsahuje

- Úvodní administrační rozhraní.
- Samostatná stránka registrací.
- Sdílený modul klienta Supabase.

## Technologie

Next.js, React, TypeScript, Tailwind CSS, Supabase.

## Architektura a struktura

- `src/app/page.tsx` — vstupní obrazovka
- `src/app/registrations/page.tsx` — rozhraní registrací
- `src/lib/supabase.ts` — datový klient

## Lokální vývoj

Potřebujete Node.js a npm. V kořenové složce repozitáře spusťte:

```sh
npm install
npm run dev
```

Příkaz pro sestavení uvedený v projektu: `npm run build`.

Jde o příkazy deklarované v repozitáři, nikoli o potvrzení úspěšného sestavení. Instalace závislostí, sestavení ani napojení na živé služby nebyly při úpravě dokumentace spuštěny.

## Konfigurace a omezení

Před prací s registračními údaji ověřte oprávnění na straně Supabase. Přítomné jsou soubory závislostí pro npm i pnpm; pro další údržbu zvolte a otestujte jeden postup.

## Co doplnit do dokumentace

Snímky obrazovky s fiktivními daty, opakovatelný postup ověření a přehled skutečně otestovaných integrací. Přihlašovací údaje a konfigurace konkrétního nasazení patří mimo Git.
