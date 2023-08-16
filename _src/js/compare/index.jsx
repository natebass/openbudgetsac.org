import React, {useEffect, useState} from "react"
import {schemeSet2 as colors} from "d3-scale-chromatic"
import Select from "react-select"
import ReactDOM from "react-dom/client";
import Total from "./Total.jsx";
import {BUDGET_TYPES} from "./utils.jsx";
import {fetchTotals} from "./api.js";
import Breakdown from "./Breakdown.jsx";
import {QueryClient, QueryClientProvider} from 'react-query'
// import {Col, Nav, Row, Tab} from "react-bootstrap";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

const styles = [{ color: colors[0] }, { color: colors[1] }];
const diffColors = {
  neg: "#e41a1c",
  pos: "#4daf4a",
}

const changesOptions = [
  {value: "pct", label: "percentage"},
  {value: "usd", label: "dollars"},
]

function getBudgetOption(record, index) {
  return {
    value: index,
    label: `${record.fiscal_year_range} ${BUDGET_TYPES[record.budget_type]}`,
  };
}

function getBudgetDefaults(budgets) {
  // TODO: add a more sophisiticated selection algorithm;
  // e.g. find current year, compare adopted to proposed,
  // or proposed to previous adopted, etc
  let index1 = 0;
  let index2 = 1;
  // 19-20 proposed, if we have it
  const currI = budgets.findIndex(record => {
    return record.label === "FY19-20 Adopted";
  });
  // 18-19 proposed, if we have it
  const prevI = budgets.findIndex(record => {
    return record.label === "FY18-19 Adopted";
  });
  // if we have both, use their indexes instead
  if (currI > -1 && prevI > -1) {
    index1 = currI;
    index2 = prevI;
  }
  return [budgets[index1], budgets[index2]];
}

const Compare = () => {
  const [budget1Choice, setBudget1Choice] = useState({})
  const [budget2Choice, setBudget2Choice] = useState({})
  const [changeType, setChangeType] = useState({
    value: "pct",
    label: "percentage",
  })
  const [selectOptions, setSelectOptions] = useState([])
  const budget1Options = selectOptions.filter(option => option.value !== budget2Choice.value)
  const budget2Options = selectOptions.filter(option => option.value !== budget1Choice.value)
  const selectedYears = [budget1Choice, budget2Choice]
  const [selectedTab, setSelectedTab] = useState(1)

  useEffect(() => {
    fetchTotals()
      .then((data) => {
        const selectOptions = data.map(option => {
          return {
            value: option.fiscal_year_range,
            budget_type: option.budget_type,
            label: `${option.fiscal_year_range} Adopted`,
            total: option.total,
          }
        })
        const defaultBudget1Choice = {
          value: data[0].fiscal_year_range,
          budget_type: data[0].budget_type,
          label: `${data[0].fiscal_year_range} Adopted`,
          total: data[0].total,
        }
        const defaultBudget2Choice = {
          value: data[1].fiscal_year_range,
          budget_type: data[1].budget_type,
          label: `${data[1].fiscal_year_range} Adopted`,
          total: data[1].total,
        }
        setBudget1Choice(defaultBudget1Choice)
        setBudget2Choice(defaultBudget2Choice)
        setSelectOptions(selectOptions)
      })
      .catch((err) => console.log(err))
  }, [fetchTotals]);
  const customStyles1 = {singleValue: provided => ({...provided, color: "#66c2a5"})}
  const customStyles2 = {singleValue: provided => ({...provided, color: "#fc8d62"})}

  return (
    <div>
      <div className="row">
        <div className="col-sm-10">
          <h1>
            Compare{" "}
            <span style={styles[0]} className="choose-budget">
               <Select
                 options={budget1Options}
                 value={budget1Choice}
                 onChange={setBudget1Choice}
                 searchable={false}
                 clearable={false}
                 styles={customStyles1}/>
             </span>{" "}
              with{" "}
            <span style={styles[1]} className="choose-budget">
               <Select
                 options={budget2Options}
                 value={budget2Choice}
                 onChange={setBudget2Choice}
                 searchable={false}
                 clearable={false}
                 styles={customStyles2}/>
             </span>
          </h1>
        </div>
        <div className="col-sm-2">
          <div className="form-group">
            <label>Show changes as:</label>
            <Select
              className="form-control"
              id="sortControl"
              value={changeType}
              onChange={setChangeType}
              options={changesOptions}
              searchable={false}
              clearable={false}/>
          </div>
        </div>
        <div className="col-sm-12">
          <Total selectedYears={selectedYears}
                 colors={colors}
                 diffColors={diffColors}
                 changeType={changeType}/>
          <h2>Budget breakdowns</h2>
          <p>Get more detail on where money came from and how it was spent.</p>
        </div>
      </div>
      <Tab.Container id="selectBreakdown" defaultActiveKey="spendDept">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="stacked">
              <Nav.Item eventKey="spendDept">Spending by Department</Nav.Item>
              <Nav.Item eventKey="spendCat">Spending by Category</Nav.Item>
              <Nav.Item eventKey="revDept">Revenue by Department</Nav.Item>
              <Nav.Item eventKey="revCat">Revenue by Category</Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="spendDept">
                <p>a</p>
                {/*<Breakdown*/}
                {/*  colors={colors}*/}
                {/*  diffColors={diffColors}*/}
                {/*  usePercent={changeType.value === "pct"}*/}
                {/*  years={selectedYears}*/}
                {/*  type="spending"*/}
                {/*  dimension="department"/>*/}
              </Tab.Pane>
              <Tab.Pane eventKey="spendCat">
                {/*<Breakdown*/}
                {/*  colors={colors}*/}
                {/*  diffColors={diffColors}*/}
                {/*  usePercent={changeType.value === "pct"}*/}
                {/*  years={selectedYears}*/}
                {/*  type="spending"*/}
                {/*  dimension="category"/>*/}
              </Tab.Pane>
              <Tab.Pane eventKey="revDept">
                {/*<Breakdown*/}
                {/*  colors={colors}*/}
                {/*  diffColors={diffColors}*/}
                {/*  usePercent={changeType.value === "pct"}*/}
                {/*  years={selectedYears}*/}
                {/*  type="revenue"*/}
                {/*  dimension="department"/>*/}
              </Tab.Pane>
              <Tab.Pane eventKey="revCat">
                {/*<Breakdown*/}
                {/*  colors={colors}*/}
                {/*  diffColors={diffColors}*/}
                {/*  usePercent={changeType.value === "pct"}*/}
                {/*  years={selectedYears}*/}
                {/*  type="revenue"*/}
                {/*  dimension="category"/>*/}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <Compare/>
    </QueryClientProvider>
);
