import Counter from '../../islands/Counter.tsx';
import Test from '../../islands/test/Test.jsx';
import { useSignal } from '@preact/signals';

export default () => {
	const count = useSignal(3);
	
	return (
		<div>
			<Counter count={count} />
			<div>------</div>
			<Test />
		</div>
	);
};
