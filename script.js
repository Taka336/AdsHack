// const inputElement = document.getElementById("input");
// inputElement.addEventListener("change", (e) => {
//   const file = e.target.files[0];
//   const reader = new FileReader();
//   reader.readAsText(file);
//   reader.onload = (e) => {
//     const data = e.target.result;
//     console.log(tsv_array(data));
//   };
// });

function tsv_data(dataPath) {
  const request = new XMLHttpRequest(); // HTTPでファイルを読み込む
  request.addEventListener("load", (event) => {
    // ロードさせ実行
    const response = event.target.responseText; // 受け取ったテキストを返す
    const data = tsv_array(response); //tsv_arrayの関数を実行
    const hoge = new Hoge(data);
    // console.log(hoge.hoge());
    console.log(hoge.spam());
  });
  request.open("GET", dataPath, true); // tsvのパスを指定
  request.send();
}

function tsv_array(data) {
  const dataArray = []; //配列を用意
  const dataString = data.replace(/"/g, "").split("\n"); //改行で分割
  for (let i = 0; i < dataString.length; i++) {
    dataArray[i] = dataString[i].split("\t");
  }
  return dataArray;
}

function Hoge(data) {
  this.headers = data[2];
  this.imp_idx = this.headers.indexOf("表示回数");
  this.click_idx = this.headers.indexOf("クリック数");
  this.cost_idx = this.headers.indexOf("費用");
  this.cv_idx = this.headers.indexOf("コンバージョン");

  this.queries = data.slice(3);

  this.hoge = function () {
    dic = {};
    this.queries.forEach((query) => {
      query[0].split(" ").forEach((morpheme) => {
        if (morpheme in dic) {
          dic[morpheme].count += 1;
          dic[morpheme].imp += this.toFloat(query[this.imp_idx]);
          dic[morpheme].click += this.toFloat(query[this.click_idx]);
          dic[morpheme].cost += this.toFloat(query[this.cost_idx]);
          dic[morpheme].cv += this.toFloat(query[this.cv_idx]);
        } else {
          dic[morpheme] = {
            count: 1,
            imp: this.toFloat(query[this.imp_idx]),
            click: this.toFloat(query[this.click_idx]),
            cost: this.toFloat(query[this.cost_idx]),
            cv: this.toFloat(query[this.cv_idx]),
          };
        }
      });
    });
    return dic;
  };

  this.spam = function () {
    let arr = [];
    const data = this.hoge();
    for (morpheme in data) {
      const count = data[morpheme].count;
      const imp = data[morpheme].imp;
      const click = data[morpheme].click;
      const cost = data[morpheme].cost;
      const cv = data[morpheme].cv;

      const ctr = click / imp;
      const cpc = cost / click;
      const cpa = cost / cv;
      const cvr = cv / click;

      arr.push([morpheme, count, imp, click, ctr, cpc, cv, cvr, cpa, cost]);
    }
    return arr;
  };

  this.toFloat = function (string) {
    return parseFloat(string.replace(/,/, ""));
  };
}

tsv_data("query.tsv");
