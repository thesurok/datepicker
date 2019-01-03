const datePicker = {
  state: {
    currentDay: moment(),
    daysInCurrentMonth: moment().daysInMonth()
  },

  data: {
    selectPeriodOptions: [
      "Custom",
      "Today",
      "Yesterday",
      "Last 7 days",
      "Last 30 days",
      "Last 90 days"
    ],
    timezones,
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    weekDays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  },

  helpers: {
    $: function({ el, cls, id, append, ihtml, val }) {
      if (typeof arguments[0] === "string") {
        return document.querySelector(arguments[0]);
      }
      //Create Element
      const element = document.createElement(el);
      //Id
      id && element.setAttribute("id", id);
      //Add Class
      cls && element.classList.add(cls);
      //Append
      append && append.appendChild(element);
      //innerHTML
      ihtml && (() => (element.innerHTML = ihtml))();
      //Value
      val && (() => (element.value = val))();
      //Attribute

      return element;
    }
  },

  buildContainer() {
    const $ = this.helpers.$;

    const wrapper = $({ el: "div", cls: "wrapper" });
    const header = $({ el: "div", cls: "header", append: wrapper });
    //Select period
    const selectPeriod = $({ el: "select", cls: "select", append: wrapper });
    this.data.selectPeriodOptions.forEach(opt => {
      $({
        el: "option",
        cls: "option",
        append: selectPeriod,
        ihtml: opt,
        val: opt
      });
    });
    //Select timezone
    const timezones = $({ el: "select", cls: "select", append: wrapper });
    this.data.timezones.forEach(opt => {
      $({
        el: "option",
        append: timezones,
        val: opt.offset,
        ihtml: `Timezone: (${opt.offset}) ${opt.name}`
      });
    });
    //Range Container
    const rangeContainer = $({
      el: "div",
      id: "range-container",
      append: wrapper
    });
    //From:
    const rangeStartLabel = $({
      el: "label",
      id: "range-start",
      append: rangeContainer
    });
    $({
      el: "span",
      cls: "range-label",
      ihtml: "From",
      append: rangeStartLabel
    });
    const rangeStart = $({
      el: "input",
      cls: "range-picker",
      id: "from",
      append: rangeStartLabel
    });
    //To:
    const rangeEndLabel = $({
      el: "label",
      id: "range-end",
      append: rangeContainer
    });
    $({
      el: "span",
      cls: "range-label",
      ihtml: "To",
      append: rangeEndLabel
    });
    const rangeEnd = $({
      el: "input",
      cls: "range-picker",
      id: "to",
      append: rangeEndLabel
    });
    //Buttons
    const buttonContainer = $({
      el: "div",
      cls: "btn-container",
      append: wrapper
    });

    //Apply
    const apply = $({
      el: "button",
      cls: "btn",
      append: buttonContainer,
      ihtml: "Apply"
    });
    apply.classList.add("btn-apply");
    //Cancel
    const cancel = $({
      el: "button",
      cls: "btn",
      append: buttonContainer,
      ihtml: "Cancel"
    });
    cancel.classList.add("btn-cancel");

    return wrapper;
  },

  setHeaderDate() {
    const header = document.querySelector(".header");
    header.innerHTML = this.state.currentDay.format("MMM DD");
  },

  buildModal(pos) {
    const $ = this.helpers.$;
    const modal = $({
      el: "div",
      cls: "modal",
      id: `modal-${pos.slice(1)}`,
      append: document.querySelector(pos)
    });
    // Current month
    const currentMonth = $({
      el: "span",
      id: "modal-month",
      append: modal,
      ihtml: this.state.currentDay.format("MMMM YYYY")
    });
    // '<' button
    const prevMonth = $({
      el: "span",
      cls: "nav-arrow",
      id: "go-bck",
      append: modal,
      ihtml: "<"
    });
    // '>' button
    const nextMonth = $({
      el: "span",
      cls: "nav-arrow",
      id: "go-fwd",
      append: modal,
      ihtml: ">"
    });
    //Create header with the names of the week
    const weekdayHeader = $({
      el: "div",
      cls: "weekday-header",
      append: modal
    });
    this.data.weekDays.forEach((_day, i) => {
      const day = $({
        el: "span",
        cls: "weekday-name",
        append: weekdayHeader,
        ihtml: _day.substr(0, 2).toUpperCase()
      });
    });
    //Create main table container
    $({
      el: "table",
      id: "day-table",
      append: modal
    });
    this.buildPicker();
  },

  buildPicker() {
    const $ = this.helpers.$,
      modal = $(".modal");

    //Create a table where all the days go
    const daysTable = $("#day-table");
    daysTable.innerHTML = "";
    //Offset is used to fill the empty cells
    let offset = this.state.currentDay.startOf("month").day(),
      dayCount = 1;
    //Create 5 rows
    for (let i = 0; i < 5; i++) {
      $({ el: "tr", id: `row-${i}`, append: daysTable });
      //Create 7 cells which represent corresponding weekday for each row
      for (let k = 0; k < 7; k++) {
        /*
         ** If the first day of the month is not a Sunday(0),
         ** fill the row with empty cells until appropriate weekday
         */
        if (!offset) {
          $({
            el: "td",
            id: `day-${dayCount}`,
            append: $(`#row-${i}`),
            ihtml: dayCount
          });
          if (dayCount >= this.state.daysInCurrentMonth) {
            break;
          }
          dayCount++;
        } else {
          $({ el: "td", append: $(`#row-${i}`) });
          offset--;
        }
      }
    }
  },

  root(location) {
    const root = document.querySelector(location);
    root.appendChild(this.buildContainer());
  },

  listenChangeMonth() {
    const $ = this.helpers.$;
    $("#go-fwd").addEventListener("click", () => {
      this.state.currentDay = this.state.currentDay.add(1, "month");
      this.refreshPicker();
    });
    $("#go-bck").addEventListener("click", () => {
      this.state.currentDay = this.state.currentDay.subtract(1, "month");
      this.refreshPicker();
    });
  },

  listenToggleModal() {
    const $ = this.helpers.$;
    $("body").addEventListener("click", e => {
      e.stopPropagation();
      if (e.target === $("#from")) {
        $("#modal-range-start").style.display = "block";
      } else {
        $("#modal-range-start").style.display = "none";
      }
    });
  },

  refreshPicker() {
    $ = this.helpers.$;
    this.state.daysInCurrentMonth = this.state.currentDay.daysInMonth();
    $("#modal-month").innerHTML = this.state.currentDay.format("MMMM YYYY");
    this.buildPicker();
  },

  log() {
    console.info(this.state);
  },

  init(root) {
    this.root(root);
    this.setHeaderDate();
    this.buildModal("#range-start");
    this.listenChangeMonth();
    this.listenToggleModal();
    this.log();
  }
};

datePicker.init("#app");
