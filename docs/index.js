const datePicker = {
  state: {
    currentDate: moment(),
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
      id: "input-range-start",
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
      id: "input-range-end",
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
    header.innerHTML = this.state.currentDate.format("MMM DD");
  },

  buildModal(pos) {
    const $ = this.helpers.$,
      id = pos.slice(1);
    const modal = $({
      el: "div",
      cls: "modal",
      id: `modal-${id}`,
      append: document.querySelector(pos)
    });
    // Current month
    const currentMonth = $({
      el: "span",
      id: `modal-month-${id}`,
      append: modal,
      ihtml: this.state.currentDate.format("MMMM YYYY")
    });
    // '<' button
    const prevMonth = $({
      el: "span",
      cls: "nav-arrow",
      id: `go-bck-${id}`,
      append: modal,
      ihtml: "<"
    });
    // '>' button
    const nextMonth = $({
      el: "span",
      cls: "nav-arrow",
      id: `go-fwd-${id}`,
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
      id: `day-table-${id}`,
      append: modal
    });
    this.buildPicker(pos);
  },

  buildPicker(pos) {
    const $ = this.helpers.$,
      id = pos.slice(1);
    modal = $(`#modal-${id}`);

    //Create a table where all the days go
    const daysTable = $(`#day-table-${id}`);
    daysTable.innerHTML = "";
    //Offset is used to fill the empty cells
    let offset = this.state.currentDate.startOf("month").day(),
      dayCount = 1;
    //Create 5 rows
    for (let i = 0; i < 5; i++) {
      $({ el: "tr", id: `row-${id}-${i}`, append: daysTable });
      //Create 7 cells which represent corresponding weekday for each row
      for (let k = 0; k < 7; k++) {
        /*
         ** If the first day of the month is not a Sunday(0),
         ** fill the row with empty cells until appropriate weekday
         */
        if (!offset) {
          $({
            el: "td",
            id: `day-${id}-${dayCount}`,
            append: $(`#row-${id}-${i}`),
            ihtml: dayCount
          });
          if (dayCount >= this.state.daysInCurrentMonth) {
            break;
          }
          dayCount++;
        } else {
          $({ el: "td", append: $(`#row-${id}-${i}`) });
          offset--;
        }
      }
    }
  },

  root(location) {
    const root = document.querySelector(location);
    root.appendChild(this.buildContainer());
  },

  listenChangeMonth(pos) {
    const $ = this.helpers.$,
      id = pos.slice(1);
    $(`#go-fwd-${id}`).addEventListener("click", () => {
      this.state.currentDate = this.state.currentDate.add(1, "month");
      this.refreshPicker(pos);
    });
    $(`#go-bck-${id}`).addEventListener("click", () => {
      this.state.currentDate = this.state.currentDate.subtract(1, "month");
      this.refreshPicker(pos);
    });
  },

  refreshPicker(pos) {
    $ = this.helpers.$;
    this.state.daysInCurrentMonth = this.state.currentDate.daysInMonth();
    $(`#modal-month-${pos.slice(1)}`).innerHTML = this.state.currentDate.format(
      "MMMM YYYY"
    );
    this.buildPicker(pos);
  },

  listenToggleModal(pos) {
    const $ = this.helpers.$,
      id = pos.slice(7);
    $("body").addEventListener("click", e => {
      e.stopPropagation();
      if (e.target === $(`#input-${id}`)) {
        $(`#modal-${id}`).style.display = "block";
      } else {
        $(`#modal-${id}`).style.display = "none";
      }
    });
  },

  log() {
    console.info(this.state);
  },

  init(root) {
    this.root(root);
    this.setHeaderDate();
    this.buildModal("#range-start");
    this.buildModal("#range-end");
    this.listenChangeMonth("#range-start");
    this.listenChangeMonth("#range-end");
    this.listenToggleModal("#input-range-start");
    this.listenToggleModal("#input-range-end");
    this.log();
  }
};

datePicker.init("#app");
