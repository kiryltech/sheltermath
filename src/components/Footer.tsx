import React from 'react';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-zinc-800 text-zinc-500 text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p>© 2026 Kiryl Dubarenka. All rights reserved.</p>
          <p className="mt-1">
            Shelter Math is open source software licensed under the <a href="https://github.com/kiryltech/sheltermath/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors underline decoration-zinc-700 underline-offset-4">MIT License</a>.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/kiryltech/sheltermath"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
