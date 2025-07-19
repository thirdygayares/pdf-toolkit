# PDF Toolkit

> Free, secure, in-browser PDF merging, splitting, compression, and text extraction—100% privacy, no uploads on server.  
> **Developed and maintained by Thirdy Gayares.**

**Live demo**: https://pdf-toolkit.thirdygayares.com

---

## Table of Contents

- [Features](#features)  
- [Pages](#pages)  
  - [Home Page](#home-page)  
  - [Merge PDF](#merge-pdf)  
  - [Extract Text](#extract-text)  
- [Getting Started](#getting-started)  
- [Tech Stack](#tech-stack)  
- [Contributing](#contributing)  
- [License](#license)  
- [About Me](#about-me)  
- [Legal](#legal)  

---

## Features

- **Merge PDF**: Combine multiple PDFs into one  
- **Extract Text**: Pull selectable text out of any PDF  
- **Client-side only**: All processing happens in the browser; we never upload your files  
- **Unlimited use**: No paywalls, no file-size limits (up to 100 MB per file)  

---

## Pages

### Home Page

Your gateway to all PDF tools and core information about PDF Toolkit.

<img width="1842" height="1178" alt="image" src="https://github.com/user-attachments/assets/50624608-e300-4cc6-8171-cba54e63ae64" />


**URL:** `https://pdf-toolkit.thirdygayares.com/`

---

### Merge PDF

Fast, drag-and-drop interface for combining PDFs. Reorder pages, remove what you don’t need, then download your single file.

<img width="1855" height="1066" alt="image" src="https://github.com/user-attachments/assets/67a4948c-f480-47f6-83f4-7a0242b57f01" />

<img width="1828" height="808" alt="image" src="https://github.com/user-attachments/assets/f2115d82-7022-43b7-bc4a-c1ca7c5bb64b" />


**URL:** `https://pdf-toolkit.thirdygayares.com/merge-pdf`

---

### Extract Text

Instantly convert any text-based PDF into plain, selectable text. Copy, download, or use the extracted content however you wish.

<img width="1829" height="1193" alt="image" src="https://github.com/user-attachments/assets/5278f6c2-4e07-4d9b-a1e0-c7f2b266b44b" />


**URL:** `https://pdf-toolkit.thirdygayares.com/pdf-extract-text`

---

## Getting Started

1. **Clone this repo**  
   ```bash
   git clone https://github.com/thirdygayares/pdf-toolkit.git
   cd pdf-toolkit
  ```

2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configure your `.env.local`**

   ```bash
   NEXT_PUBLIC_GA_ID=Google Analytics Code
   ```
4. **Run in development**

   ```bash
   npm run dev
   ```
5. **Build & generate sitemap**

   ```bash
   npm run build
   # (this also runs `next-sitemap` via postbuild)
   npm start
   ```

---

## Tech Stack

* [Next.js](https://nextjs.org) (App Router, Metadata API)
* [React](https://reactjs.org)
* [Shadcn](https://ui.shadcn.com/)
* [Vercel](https://vercel.com/)
* [Tailwind CSS](https://tailwindcss.com)
* [Google Analytics (gtag)](https://developers.google.com/analytics)
* [next-sitemap](https://github.com/iamvishnusankar/next-sitemap) for sitemap & robots.txt

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "feat: add YourFeature"`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

## About Me

**Thirdy Gayares**
Passionate developer creating custom solutions for everyone.

* [My Website](https://thirdygayares.com)
* [Facebook](https://www.facebook.com/thirdygayares.ph)
* [YouTube](https://www.youtube.com/@thirdygayares)
* [LinkedIn](https://www.linkedin.com/in/thirdygayares/)
* [Github](https://github.com/thirdygayares)
---

## Legal

* [Privacy Policy](https://pdf-toolkit.thirdygayares.com//privacy-policy)
* [Terms of Service](https://pdf-toolkit.thirdygayares.com//terms-of-service)
* [Cookie Policy](https://pdf-toolkit.thirdygayares.com//cookie-policy)

---
