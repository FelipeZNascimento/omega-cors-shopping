var sql = require('../../sql/sql');
const CONSTANTS = require('../constants/sql');

//Task object constructor
var Place = function (place) {
    this.id = place.id;
    this.place = place.place;
    this.description = place.description;
    this.categoryId = place.category_id;
};

const now = new Date();

Place.sortableColumns = [
    'description',
    'category_description',
    'created',
    'id'
];

Place.create = function (newItems, result) {
    const items = newItems.map((item) => {
        return [
            item.id,
            item.description,
            item.categoryId
        ]
    });

    const query = 'INSERT INTO places (id, description, category_id) VALUES ? ON DUPLICATE KEY UPDATE description = VALUES(description)';
    sql.query(query, [items], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            console.log('(' + now + ') Entry ' + res.insertId + ' succesfully saved at places (lines affected:' + res.affectedRows + ').');
            result(null, res);
        }
    });
};

Place.getPlaceById = function (placeId, result) {
    sql.query("SELECT task FROM places WHERE id = ? ", placeId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);

        }
    });
};

Place.getTotalCount = async function (searchField, result) {
    const query = `SELECT COUNT(*) AS totalCount FROM places
        INNER JOIN places_categories ON (places.category_id = places_categories.id)
        WHERE places.description LIKE ? OR places_categories.description LIKE ?`;

    sql.query(query, [`%${searchField}%`, `%${searchField}%`], function (err, countResult) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, countResult[0].totalCount);
        }
    });
}

Place.getAllNames = async function (result) {
    const query = `SELECT id, description FROM places
        ORDER BY description ASC`;

    sql.query(query, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Place.getAll = async function (orderBy, sort, page, searchField, result) {
    const firstElement = page * CONSTANTS.PAGINATION_OFFSET;
    const ascQuery = `SELECT places.*, places_categories.description as category_description FROM places
        INNER JOIN places_categories ON (places.category_id = places_categories.id)
        WHERE places.description LIKE ? OR places_categories.description LIKE ?
        ORDER BY ?? ASC
        LIMIT ?, ?`;

    const descQuery = `SELECT places.*, places_categories.description as category_description FROM places
        INNER JOIN places_categories ON (places.category_id = places_categories.id)
        WHERE places.description LIKE ? OR places_categories.description LIKE ?
        ORDER BY ?? DESC
        LIMIT ?, ?`;

    const query = sort === 'ASC' ? ascQuery : descQuery;
    sql.query(query, [`%${searchField}%`, `%${searchField}%`, orderBy, firstElement, CONSTANTS.PAGINATION_OFFSET], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};
Place.updateById = function (id, place, result) {
    sql.query("UPDATE places SET place = ? WHERE id = ?", [place.place, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};
Place.delete = function (id, result) {
    sql.query("DELETE FROM places WHERE id = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

module.exports = Place;
