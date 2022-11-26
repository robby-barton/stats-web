import { useEffect } from 'react';
import Script from 'next/script';

import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables.min.js';
// import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-fixedheader-dt/js/fixedHeader.dataTables.min.js';

import $ from 'jquery';


export default function DataTablesScripts() {
  return (
    <Script>
      {
        useEffect(() => {
          $(document).ready(function () {
            $('#resultTable').DataTable({
              paging: false,
              searching: true,
              orderClasses: false,
              info: false,
              fixedHeader: {
                header: true,
                headerOffset: $('#fixed').offset().top + $('#fixed').outerHeight(true)
              }
            })
          })
        }, [])
      }
    </Script>
  )
}
