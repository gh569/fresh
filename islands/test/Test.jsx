import style from './test.module.css'
import {useSignal} from '@preact/signal'
export default ()=>{
	const count =useSignal(0)
	return <div className={style.test}>{count.value}</div>
}