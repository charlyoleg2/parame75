<script lang="ts">
	import type { Snippet } from 'svelte';
	import { repoToHomepage } from '$lib/general.js';
	import { resolve } from '$app/paths';
	import { version_details } from 'geometrix';
	import topPackage from '../../../../package.json' with { type: 'json' };
	import libPackage from '../../../desi75/package.json' with { type: 'json' };
	import appPackage from '../../package.json' with { type: 'json' };

	// props
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();

	const detailed_versions = version_details(appPackage);
</script>

<header>
	<h1>Welcome to Desi75-UI</h1>
	<h6>
		Display the designs of <a href={topPackage.homepage} rel="external">{libPackage.name}</a>.
		Powered by the framework
		<a href="https://charlyoleg2.github.io/parametrix/">parametrix</a>.
	</h6>
	<nav>
		<a href={resolve('/')}>index: list of designs</a>
	</nav>
</header>
<main>
	{@render children?.()}
</main>
<footer>
	<article>
		<h3>{topPackage.name}</h3>
		<code>
			<a href={repoToHomepage(topPackage.repository.url)} rel="external">{topPackage.name}</a>
			version {topPackage.version}
		</code>
	</article>
	<article>
		<h3>desi75-ui</h3>
		Built with
		<a href="https://www.npmjs.com/package/geometrix">geometrix</a> and
		<a href="https://www.npmjs.com/package/geomui">geomui</a>.
		<code>
			<br />
			{#each detailed_versions as dversion, idx (idx)}
				{dversion}<br />
			{/each}
		</code>
	</article>
	<article>
		<h3>Parametrix</h3>
		<pre>The base libraries</pre>
		<ol>
			<li><a href="https://github.com/charlyoleg2/parametrix">Parametrix repo</a></li>
			<li><a href="https://charlyoleg2.github.io/parametrix/">Parametrix page</a></li>
			<li><a href="https://parametrix.fr/">Parametrix catalog</a></li>
		</ol>
	</article>
</footer>

<style lang="scss">
	:global(body) {
		font-family: 'Courier New', 'Helvetica', 'Arial', 'Verdana';
		margin: 0;
		padding: 0;
		background-color: DarkCyan;
	}
	h1 {
		color: aquamarine;
		margin: 1rem;
		margin-bottom: 0.2rem;
	}
	h3 {
		margin: 1rem;
		margin-bottom: 0.2rem;
	}
	h6 {
		margin: 1rem;
		margin-top: 0.2rem;
	}
	nav {
		margin: 1rem;
	}
	nav > a {
		display: inline-block;
		color: black;
		background-color: GhostWhite;
		text-decoration: none;
		padding-left: 0.3rem;
		padding-right: 0.3rem;
		border-style: solid;
		border-width: 0.2rem;
		border-radius: 0.6rem;
		border-color: Brown;
		margin-top: 0.1rem;
		margin-left: 0.1rem;
	}
	nav > a:hover {
		background-color: yellow;
	}
	main {
		background-color: GhostWhite;
		min-height: 70vh;
		padding-top: 2rem;
		padding-bottom: 3rem;
	}
	footer {
		margin: 1rem;
		margin-top: 5rem;
		margin-bottom: 5rem;
	}
</style>
