# Frontend – Hashlog Blog Platform

This is the **Next.js (TypeScript)** frontend for the **Hashlog** microservice-based blog platform. It interacts with backend microservices such as **author**, **user**, and **blog** through REST APIs.

Built with modern UI using **Tailwind CSS**, **ShadCN UI**, **JoditEditor**, and integrated with **Google OAuth**, this frontend is fast, responsive, and developer-friendly.

---

##  Features

*  Built with **Next.js 15+** and **App Router**
* Styled using **Tailwind CSS** & **ShadCN UI**
* AI blog generation powered by backend services
* Google OAuth login with JWT session
* Support for blog creation, editing, saving/bookmarking
* Comments and user interaction
* Image upload support (Cloudinary integrated)
* Fully typed with TypeScript

---

## Installation

```bash
git clone https://github.com/TheSoumenMondal/hashlog.git
cd hashlog/frontend
npm install
```

---

## Development Server

```bash
npm run dev
```

App runs locally at:
 [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env` file in the root of the `frontend/` directory:

```env
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_AUTHOR_SERCIE=http://localhost:PORT
NEXT_PUBLIC_BLOG_SERCIE=http://localhost:PORT
NEXT_PUBLIC_USER_SERCIE=http://localhost:PORT
```
---
## Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Lint code using ESLint
```

---

## Technologies Used

| Purpose       | Tech Stack              |
| ------------- | ----------------------- |
| **Framework** | Next.js (App Router)    |
| **Language**  | TypeScript              |
| **Styling**   | Tailwind CSS, ShadCN UI |
| **Rich Text** | JoditEditor             |
| **Auth**      | Google OAuth + JWT      |
| **HTTP**      | Axios                   |
| **State**     | React Context API       |
| **Toast**     | Sonner                  |

---

## API Services Used

This frontend consumes APIs from the following services:

* `author-service` → Blog creation & AI generation
* `user-service` → Auth, profiles, bookmarks
* `blog-service` → Blog listing, comments, and bookmarks
