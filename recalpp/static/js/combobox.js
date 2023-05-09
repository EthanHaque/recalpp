"use strict";

/**
 * This method is used to initialize the combobox.
 */
function init_combobox() {
  const courseHistoryCombobox = $(".js-example-basic-multiple");
  courseHistoryCombobox
    .select2({
      width: "100%",
      closeOnSelect: false,
      ajax: {
        url: `/api/v1/courses`,
        data: function (params) {
          if (params.term === undefined) {
            return { term_code: currentTerm };
          } else {
            const parsedSearch = parseSearchString(params.term);
            const query = constructAPIQuery(parsedSearch);
            return { term_code: currentTerm, ...query };
          }
        },
        processResults: function (data) {
          return {
            results: data.map((course) => ({
              id: JSON.stringify(course),
              text: `${course.subject_code} ${course.catalog_number}`,
            })),
          };
        },
      },
    })
    .on("change", function (e) {
      const selectedValues = $(this).val();
      const courses = selectedValues.map((course) => JSON.parse(course));
      const guidToCourseMap = {};
      courses.forEach((course) => {
        guidToCourseMap[course.guid] = course;
      });
      User.setCourseHistory(guidToCourseMap);
      displayMetrics();
    });
  setPreviouslySelectedCourses(courseHistoryCombobox);

  const majorSelectCombobox = $(".js-example-basic-single");
  setPreviouslySelectedMajor(majorSelectCombobox);
  majorSelectCombobox
    .select2({
      width: "100%",
      closeOnSelect: true,
      minimumResultsForSearch: Infinity,
      ajax: {
        url: `/api/v1/majors`,
        data: function (params) {
          return {};
        },
        processResults: function (data) {
          return {
            results: data.map((major) => ({
              id: JSON.stringify(major),
              text: `${major.name}`,
            })),
          };
        },
      },
    })
    .on("change", function (e) {
      const selectedMajor = $(this).val();
      const major = JSON.parse(selectedMajor);
      User.setMajor(major.name);
      User.updateRelevantCourses().then(function (courses) { 
        User.setRelevantCourses(courses);
        displayMetrics();
      }
      );
    });
}

function setPreviouslySelectedCourses($comboBox) {
  const courseHistory = User.getCourseHistory();
  const selectedCourses = [];

  for (const guid in courseHistory) {
    const course = courseHistory[guid];
    selectedCourses.push({
      id: JSON.stringify(course),
      text: `${course.subject_code} ${course.catalog_number}`,
    });
  }

  // Set the selected options in the combobox
  $comboBox.val(selectedCourses.map((course) => course.id)).trigger("change");

  // Add the selected options to the combobox
  selectedCourses.forEach((course) => {
    const option = new Option(course.text, course.id, true, true);
    $comboBox.append(option).trigger("change");
  });
}

function setPreviouslySelectedMajor($comboBox) {
  const major = User.getMajor();
  const selectedMajor = {
    name: `${major}`,
  };

  // Set the selected options in the combobox
  $comboBox.val(JSON.stringify(selectedMajor)).trigger("change");

  // Add the selected options to the combobox
  const option = new Option(major, true, true);
  $comboBox.append(option).trigger("change");
}
