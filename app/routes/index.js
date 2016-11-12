var moment = require('moment');

module.exports = function(router, app, db, passport) {
    router.get('/', function(req, res) {
        res.render('index');
    });

    router.get('/login', function(req, res) {
        res.render('login');
    });

    router.post('/login',
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login'
        })
    );

    router.get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });

    router.get('/dashboard', function(req, res, next) {
        console.log("dashboard, req.user", req.user);
        db.getUser("jacky", function(user) {
            db.getAllUserPlots('jacky', function(plots) {
                res.render('dashboard', { title_addon: "Dashboard", user, plots: plots});
            });
        });
    });

    router.get('/graph/:id', function(req, res) {
        db.getGraph("jacky", req.params.id, function(graph) {
            res.render('graph', { title_addon: "Graph", graph });
        });
    });

    router.get('/graph/search/:begin', function(req, res) {
        console.log(req.params.begin);
        db.graphsBeginWith(req.params.begin + '%', function(graphs) {
            console.log(graphs);
            res.json(graphs);
        });
    });

    router.post('/graph/addPoint', function(req, res, next) {
        const date = moment(req.body.date, "MMMM D, YYYY").toISOString();
        db.addPoint(parseInt(req.body.id), parseInt(req.body.value), date, function(data) {
            console.log("Added points: ", data);
            res.redirect("/graph/" + req.body.id);
        });
    });

    router.post('/graph/new', function(req, res) {
        console.log(req.body.name);
        db.addGraph('jacky', req.body.name, function() {
            res.redirect('/');
        });
    });

    router.get('/fusion/:id', function(req, res) {
        db.getFusion("jacky", req.params.id, function(plots) {
            res.render('fusion', { title_addon: "Fusion", fusion: plots.fusion, userGraphs: plots.userGraphs });
        });
    });

    router.post('/fusion/new', function(req, res) {
        db.addFusion('jacky', req.body.name, function() {
            res.redirect('/');
        });
    });

    router.post('/fusion/add', function(req, res) {
        console.log(req.body);
        db.addGraphsToFusion(req.body.fusion_id, req.body.graphs_added, function() {
            res.redirect('/fusion/' + req.body.fusion_id);
        });
    });

    router.post('/fusion/invite', function(req, res) {
        app.get('io').emit('notify', "helloworld");
        res.redirect('/fusion/' + req.body.fusion_id);
    });

    router.post('/friends/add', function(req, res) {
        db.addFriendRequest(req.body.user_a, req.body.user_b, function() {
            res.redirect('/');
        });
    });
}

// module.exports = router;