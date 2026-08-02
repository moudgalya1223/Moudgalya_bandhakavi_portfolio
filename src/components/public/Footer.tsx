'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          &copy; {currentYear} Moudgalya Bandhakavi. All rights reserved. Made for high-impact software engineering & AI solutions.
        </p>
      </div>
    </footer>
  );
}
