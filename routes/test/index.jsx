import { useSignal } from '@preact/signals';
import Test from '../../islands/test/Test.jsx';
import { Head } from "fresh/runtime";

export default () => {
	const scriptCode = `
	    import m from "https://cdn.jsdelivr.net/gh/gh569/fresh@main/static/data.js";
	    console.log("拿到数据", m);
	  `;
	return (
	
		<div>
		<head>
		<script type="module" dangerouslySetInnerHTML={{ __html: scriptCode }} />
		<script type='module' src='/test.js'/>
		</head>
		
			<button id='div'>点击这里</button>
			
			<Test />
		</div>
	);
};
