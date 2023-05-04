"use strict";

/**
 * This method is used to initialize the combobox.
 */
function init_combobox() {
  const combobox = $(".js-example-basic-multiple");
  combobox
    .select2({
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
  
    setPreviouslySelectedCourses(combobox);
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