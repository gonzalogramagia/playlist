
export default function Footer() {
  return (
    <footer className="mt-0 border-t border-gray-100 py-8 pb-24">
      <p className="mt-8 text-neutral-500 dark:text-neutral-300 text-center">
        © {new Date().getFullYear()} | Mens sana in corpore sano
      </p>
    </footer>
  );
}
