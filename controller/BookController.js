// 권수혁

const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const ensureAuthorization = require("../auth");
const jwt = require("jsonwebtoken");

const allBooks = (req, res) => {
  let allBooksRes = {};
  let { category_id, news, limit, currentPage } = req.query;

  // limit - page 당 도서 수
  // currentPage - 현재 페이지
  // offset - limit * (currentPage -1)

  let offset = limit * (currentPage - 1);

  let sql =
    "SELECT SQL_CALC_FOUND_ROWS books.*, (SELECT COUNT(*) FROM likes WHERE books.id = likes.liked_book_id) AS likes FROM books";

  let values = [];
  if (category_id && news) {
    sql =
      sql +
      " WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    values = [category_id];
  } else if (category_id) {
    sql = sql + " WHERE category_id=?";
    values = [category_id];
  } else if (news) {
    sql =
      sql +
      " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH ) AND NOW()";
  }

  sql += " LIMIT ? OFFSET ?";
  values.push(parseInt(limit), offset);

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.length) {
      results.map(function (result) {
        result.pubDate = result.pub_date;
        delete result.pub_date;
      });
      allBooksRes.books = results;
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });

  sql = "SELECT found_rows()";

  conn.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = results[0]["found_rows()"];

    allBooksRes.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksRes);
  });
};

const bookDetail = (req, res) => {
  // 로그인 상태면 liked 추가해서
  // 로그인 상태 아니면 liked 빼고
  let decodedJwt = ensureAuthorization(req, res);

  if (decodedJwt instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요",
    });
  } else if (decodedJwt instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let book_id = req.params.id;

    let sql;
    let values;

    if (decodedJwt instanceof ReferenceError) {
      sql = `SELECT * ,
      (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
      FROM books 
      LEFT JOIN category
      ON books.category_id = category.category_id
      WHERE books.id=?`;
      values = [book_id];
    } else {
      sql = `SELECT * ,
      (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes,
      (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id=?)) AS liked
      FROM books 
      LEFT JOIN category
      ON books.category_id = category.category_id
      WHERE books.id=?`;
      values = [decodedJwt.id, book_id, book_id];
    }

    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      console.log(results);
      if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
      else return res.status(StatusCodes.NOT_FOUND).end();
    });
  }
};

module.exports = { allBooks, bookDetail };
