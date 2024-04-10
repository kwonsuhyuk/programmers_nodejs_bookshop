const express = require("express");
const router = express.Router();

router.use(express.json());

router.post("/", (req, res) => {
  res.json("장바구니 담기");
});

router.get("/", (req, res) => {
  res.json("장바구니 조회");
});

router.delete("/:id", (req, res) => {
  res.json("장바구니 도서 삭제");
});

// 장바구니 에서 선택한 주문 예상 상품 목록 조회
// router.get("/carts/:id", (req, res) => {
//   res.json("장바구니 도서 삭제");
// });

module.exports = router;
