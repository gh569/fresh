import style from './test.module.css';
import { useSignal } from '@preact/signals';
import dialog from './dialog.js'
import About from './about.jsx'

export default () => {
	const count = useSignal(0);
	const onClick = () => {
		count.value++;
		dialog.show(<About />)
	}
	return (
		<div className={style.test} onClick={onClick}>
			{count.value} 
			
		</div>
	);
};
