export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container mx-auto px-4 my-4">
			{children}
		</div>
	);
}