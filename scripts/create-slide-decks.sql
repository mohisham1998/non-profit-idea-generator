CREATE TABLE IF NOT EXISTS slide_decks (
  id SERIAL PRIMARY KEY,
  "userId" integer NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  "slideCount" integer DEFAULT 0 NOT NULL,
  "thumbnailUrl" text,
  slides text,
  status varchar(20) DEFAULT 'draft' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
