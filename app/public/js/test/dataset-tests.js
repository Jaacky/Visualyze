let assert = chai.assert;

describe('Dataset', function() {
	before(function() {
		let dates = [];
		let date = moment().format();
		dates.push(moment(date).format());
		dates.push(moment(date).add(1, 'w').format());
		dates.push(moment(date).add(1, 'M').format());
		dates.push(moment(date).add(1, 'y').format());

		// create Graph
		let points = [];
		for (var i=0; i<dates.length; i++) {
			let pt = { 
				colour: "#000",
				date: dates[i],
				graph: 'name',
				owner: 'owner',
				value: Math.random()
			}
			points.push(pt);
		}
		let graph = { points };

		// create Fusion
		// create Datasets
		let ds = new GraphDataset(graph);
	});

	it('should get points from a graph');
	it('should get points from a fusion');


	describe('#getYearSet(<time>)', function() {
		it('should return set of points within the same year of <time>', function() {

		});
	});


	describe('#getMonthSet(<time>)', function() {
		it('should return set of points within the same month of <time>');
	});


	describe('#getWeekSet(<time>)', function() {
		it('should return set of points within the same week of <time>');
	});
});

// converter returns in either day of year, day of month, day of week
// for plotting