const inputElement = document.getElementById("input");
const tbody = document.getElementById("tbody");
const table = document.getElementById("table");
const button = document.getElementById("js-button");

function tsv_array(data) {
  const dataArray = [];
  const dataString = data.replace(/"/g, "").split("\n");
  for (let i = 0; i < dataString.length; i++) {
    dataArray[i] = dataString[i].split("\t");
  }
  return dataArray;
}

function createTable(dataArray) {
  dataArray.forEach((r) => {
    let tds = "";
    r.forEach((d) => {
      tds += `<td>${d}</td>`;
    });
    tbody.innerHTML += `<tr>${tds}</tr>`;
  });
}

function MorphemeReporter(data) {
  this.headers = data[2];
  this.imp_idx = this.headers.indexOf("表示回数");
  this.click_idx = this.headers.indexOf("クリック数");
  this.cost_idx = this.headers.indexOf("費用");
  this.cv_idx = this.headers.indexOf("コンバージョン");

  this.queries = data.slice(3, -3);

  this.aggregateByMorpheme = function () {
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

  this.getMorphemeReport = function () {
    let arr = [];
    const data = this.aggregateByMorpheme();
    for (morpheme in data) {
      const count = data[morpheme].count;
      const imp = data[morpheme].imp;
      const click = data[morpheme].click;
      const cost = data[morpheme].cost;
      const cv = data[morpheme].cv;

      const ctr = imp == 0 ? 0 : click / imp;
      const cpc = click == 0 ? 0 : cost / click;
      const cpa = cv == 0 ? 0 : cost / cv;
      const cvr = click == 0 ? 0 : cv / click;

      arr.push([
        morpheme,
        new Intl.NumberFormat("ja-JP").format(count),
        new Intl.NumberFormat("ja-JP").format(imp),
        new Intl.NumberFormat("ja-JP").format(click),
        new Intl.NumberFormat("ja-JP", {
          style: "percent",
          maximumSignificantDigits: 4,
        }).format(ctr),
        new Intl.NumberFormat("ja-JP").format(cpc),
        new Intl.NumberFormat("ja-JP").format(cv),
        new Intl.NumberFormat("ja-JP", {
          style: "percent",
          maximumSignificantDigits: 4,
        }).format(cvr),
        new Intl.NumberFormat("ja-JP").format(cpa),
        new Intl.NumberFormat("ja-JP").format(cost),
      ]);
    }
    return arr;
  };

  this.toFloat = function (string) {
    return parseFloat(string.replace(/,/, ""));
  };
}

inputElement.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (e) => {
    const data = tsv_array(e.target.result);
    const mr = new MorphemeReporter(data);
    const arr = mr.getMorphemeReport();
    createTable(arr);
  };
});

button.addEventListener("click", () => {
  // 選択エリアを定義
  const range = document.createRange();
  range.selectNodeContents(table);

  // 選択
  window.getSelection().addRange(range);

  // クリップボードにコピー
  document.execCommand("copy");

  // 選択解除
  window.getSelection().removeRange(range);
});
