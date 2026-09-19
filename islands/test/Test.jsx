import style from './test.module.css';
import { useSignal,useSignalEffect } from '@preact/signals';
import dialog from './dialog.js'
import About from './about.jsx'
import Home from './home.jsx'
import {Router, Route, Switch} from 'https://esm.sh/wouter-preact@3.9.0'
import {useHashLocation} from 'https://esm.sh/wouter-preact@3.9.0/use-hash-location'

export default ({value}) => {
	const age = useSignal(0);
	const name=useSignal('')
	useSignalEffect(()=>{
		if(value && value.name){
			name.value=value.name
		}
		if(value && value.age && typeof (value.age)=='number'){
			age.value=value.age
		}
	})
	
	const onClick = () => {
		age.value++
		// dialog.show(<About />)
	}
	return (
		<div className={style.container} >
			
			<div>姓名:{name.value}</div>
			<div>年龄:{age.value}</div>
			
			<button className={style.test} onClick={()=>age.value--}>减小年龄</button> 
			<button className={style.test} onClick={()=>age.value++}>增加年龄</button> 
			
		</div>
	);
};
