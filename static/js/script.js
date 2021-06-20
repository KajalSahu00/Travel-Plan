onload = function () {
  let V, data;

  const container = document.getElementById("mynetwork");
  const container2 = document.getElementById("mynetwork2");
  const genNew = document.getElementById("generate-new");
  const solve = document.getElementById("solve");
  const temptext = document.getElementById("temptext");

  const cities = [
    "Delhi",
    "Mumbai",
    "Gujarat",
    "Goa",
    "Kanpur",
    "Jammu",
    "Hyderabad",
    "Bangalore",
    "Gangtok",
    "Meghalaya",
  ];

  const options = {
    edges: {
      labelHighlightBold: true,
      font: {
        size: 20,
      },
    },
    nodes: {
      font: "12px arial red",
      scaling: {
        label: true,
      },
      shape: "icon",
      icon: {
        face: "FontAwesome",
        code: "\uf015",
        size: 40,
        color: "#991133",
      },
    },
  };

  const network = new vis.Network(container);
  network.setOptions(options);

  const network2 = new vis.Network(container2);
  network2.setOptions(options);

  function createData() {
    V = Math.floor(Math.random() * 7) + 4; // 4 to 10

    let nodes = [];
    for (let i = 1; i <= V; i++) {
      nodes.push({ id: i, label: cities[i - 1] });
    }

    nodes = new vis.DataSet(nodes);

    let edges = [];
    for (let i = 2; i <= V; i++) {
      let neigh = i - Math.floor(Math.random() * Math.min(i - 1, 2) + 1); // i-1 to i-2
      edges.push({
        type: 0,
        from: i,
        to: neigh,
        color: "orange",
        label: String(Math.floor(Math.random() * 70) + 68),
      });
    }

    for (let i = 1; i <= V / 2; i++) {
      let n1 = Math.floor(Math.random() * V) + 1;
      let n2 = Math.floor(Math.random() * V) + 1;
      if (n1 != n2) {
        if (n1 < n2) {
          let tmp = n2;
          n2 = n1;
          n1 = tmp;
        }

        let check = 0;
        for (let j = 0; j < edges.length; j++) {
          if (edges[j]["from"] === n1 && edges[j]["to"] === n2) {
            if (edges[j]["type"] === 0) check = 1;
            else check = 2;
          }
        }
        if (check <= 1) {
          if (check === 0 && i < V / 4) {
            edges.push({
              type: 0,
              from: n1,
              to: n2,
              color: "orange",
              label: String(Math.floor(Math.random() * 70) + 68),
            });
          } else {
            edges.push({
              type: 1,
              from: n1,
              to: n2,
              color: "green",
              label: String(Math.floor(Math.random() * 60) + 15),
            });
          }
        }
      }
    }

    data = {
      nodes: nodes,
      edges: edges,
    };
  }

  genNew.onclick = function () {
    createData();
    network.setData(data);
    createGraph();
    temptext.style.display = "inline";
    container2.style.display = "none";
  };

  solve.onclick = function () {
    src = document.getElementById("src").value;
    dest = document.getElementById("dest").value;
    solveData(src, dest);
    temptext.style.display = "none";
    container2.style.display = "inline";
    network2.setData(ans_data);
  };

  function createGraph() {
    graph = [];
    for (let i = 1; i <= V; i++) {
      graph.push([]);
    }

    for (let i = 0; i < data["edges"].length; i++) {
      let edge = data["edges"][i];
      if (edge["type"] === 1) continue;

      graph[edge["to"] - 1].push([edge["from"] - 1, parseInt(edge["label"])]);
      graph[edge["from"] - 1].push([edge["to"] - 1, parseInt(edge["label"])]);
    }
  }

  function solveData(src, dest) {
    let srcIdx = -1;
    let destIdx = -1;

    src = src.toLowerCase();
    dest = dest.toLowerCase();

    let city;
    for (let i = 0; i < cities.length; i++) {
      city = cities[i].toLowerCase();
      if (city == src) srcIdx = i;
      if (city == dest) destIdx = i;
    }

    src.innerText = "";
    dest.innerText = "";

    if (srcIdx === -1 || destIdx === -1) {
      alert("Invalid Data");
      return;
    }
    let dist1 = djikstra(srcIdx);
    let dist2 = djikstra(destIdx);

    let min_dist = dist1[destIdx][0];

    let { plane, p1, p2 } = shouldTakePlane(dist1, dist2, min_dist);

    new_edges = [];
    if (plane != 0) {
      new_edges.push({
        arrows: { to: { enabled: true } },
        from: p1 + 1,
        to: p2 + 1,
        color: "green",
        label: String(plane),
      });

      push_edges(dist1, p1, false);
      push_edges(dist2, p2, true);
    } else {
      push_edges(dist1, destIdx, false);
    }
    ans_data = {
      nodes: data["nodes"],
      edges: new_edges,
    };
  }

  function djikstra(srcIdx) {
    let vis = Array(V).fill(0);
    let dist = [];

    for (let i = 1; i <= V; i++) dist.push([10000, -1]);

    dist[srcIdx][0] = 0;

    for (let i = 0; i < V; i++) {
      let temp = -1;

      for (let j = 0; j < V; j++) {
        if (vis[j] === 0) {
          if (temp === -1 || dist[j][0] < dist[temp][0]) temp = j;
        }
      }

      vis[temp] = 1;
      for (let j = 0; j < graph[temp].length; j++) {
        let nbr = graph[temp][j];

        if (vis[nbr[0]] === 0 && dist[nbr[0]][0] > dist[temp][0] + nbr[1]) {
          dist[nbr[0]][0] = dist[temp][0] + nbr[1];
          dist[nbr[0]][1] = temp;
        }
      }
    }
    return dist;
  }

  function shouldTakePlane(dist1, dist2, min_dist) {
    let plane = 0;
    let p1 = -1;
    let p2 = -1;

    for (let i = 0; i < data["edges"].length; i++) {
      let edge = data["edges"][i];

      if (edge["type"] === 1) {
        let from = edge["from"] - 1;
        let to = edge["to"] - 1;
        let wgt = parseInt(edge["label"]);

        if (dist1[to][0] + wgt + dist2[from][0] < min_dist) {
          plane = wgt;
          p1 = to;
          p2 = from;
          min_dist = dist1[to][0] + wgt + dist2[from][0];
        }

        if (dist1[from][0] + wgt + dist2[to][0] < min_dist) {
          plane = wgt;
          p1 = from;
          p2 = to;
          min_dist = dist1[from][0] + wgt + dist2[to][0];
        }
      }
    }
    return { plane, p1, p2 };
  }

  function push_edges(dist, curr, reverse) {
    while (dist[curr][0] != 0) {
      let fm = dist[curr][1];
      if (reverse)
        new_edges.push({
          arrows: { to: { enabled: true } },
          from: curr + 1,
          to: fm + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      else
        new_edges.push({
          arrows: { to: { enabled: true } },
          from: fm + 1,
          to: curr + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      curr = fm;
    }
  }

  genNew.click();
};
