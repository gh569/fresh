import style from './test.module.css';
import { useSignal } from '@preact/signals';
export default () => {
	const count = useSignal(0);
	const onClick = () => count.value++;
	return (
		<div className={style.test} onClick={onClick}>
			{count.value} 
			
		</div>
	);
};
