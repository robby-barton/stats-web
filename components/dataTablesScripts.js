import { useEffect } from 'react';
import Script from 'next/script';

import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables.min.js';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-plugins/features/scrollResize/dataTables.scrollResize.min.js';

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
              scrollY: 100,
              scrollResize: true,
              scrollCollapse: true,
              lengthChange: false
            })
          })
        }, [])
      }
    </Script>
  )
}
