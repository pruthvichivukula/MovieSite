//const app = express();



function test_page(req, res) {
    res.render('refresh_test.ejs')
}


module.exports = { 
    test_page: test_page
};