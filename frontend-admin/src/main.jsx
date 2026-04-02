// This is a temporary shim to bypass aggressive Service Worker caching of index.html
// which was referencing the legacy main.jsx file instead of the new main.tsx file.
// Once your browser eventually updates the cached index.html, this file will no longer be used.
import './main.tsx';
