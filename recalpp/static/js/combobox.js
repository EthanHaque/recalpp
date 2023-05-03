/**
 * This method is used to initialize the combobox.
 */
function init_combobox() {
  $(".js-example-basic-multiple")
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
    });
}
