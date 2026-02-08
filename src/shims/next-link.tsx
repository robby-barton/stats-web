import { PropsWithChildren } from 'react';

type LinkProps = PropsWithChildren<{ href: string; className?: string; title?: string }>;

export default function Link({ href, className, title, children }: LinkProps) {
	return (
		<a href={href} className={className} title={title}>
			{children}
		</a>
	);
}
