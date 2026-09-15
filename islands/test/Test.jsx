import style from './test.module.css';
import { useSignal } from '@preact/signals';
import dialog from './dialog.js'
import About from './about.jsx'
import Home from './home.jsx'
import {Router, Route, Switch} from 'https://esm.sh/wouter-preact@3.9.0'
import {useHashLocation} from 'https://esm.sh/wouter-preact@3.9.0/use-hash-location'

export default () => {
	const count = useSignal(0);
	const onClick = () => {
		count.value++;
		dialog.show(<About />)
	}
	return (
		<div  >
			
			<button className={style.test} onClick={onClick}>{count.value}</button> 
			
		</div>
	);
};
