let assert = chai.assert;

describe('Dataset', function() {
	var points;
	var gDataset;
	var fDataset;
	var fusion;

	beforeEach(function(done) {
		let dates = [];
		let date = moment().format();
		dates.push(moment(date).format());
		dates.push(moment(date).add(1, 'w').format());
		dates.push(moment(date).add(1, 'M').format());
		dates.push(moment(date).add(1, 'y').format());

		// create Graph
		points = [];
		for (var i=0; i<dates.length; i++) {
			var pt = { 
				colour: "#000",
				date: dates[i],
				graph: "name",
				owner: "owner",
				value: Math.random(),
			};
			points.push(pt);
		}
		let graph = { points };
		let fusion = { graphs: [graph, graph] };
		// create Fusion
		// create Datasets
		gDataset = new GraphDataset(graph);
		fDataset = new FusionDataset(fusion);
		done();
	});

	it('should get points from a graph', function() {
		assert.sameDeepMembers(points, gDataset.data, 'Graph has same points as dataset.');
	});

	it('should get points from a fusion', function() {
		assert.sameDeepMembers(fDataset.data, points.concat(points), 'Fusion dataset has the same points as fusion.');
		assert.lengthOf(fDataset.data, points.concat(points).length, 'Fusion dataset has the same length as fusion.');
	});

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