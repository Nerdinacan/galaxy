## Include JavaScript code to refresh Galaxy application frames as needed.
<%def name="handle_refresh_frames()">

    <!--
    refresh frames: ${refresh_frames}
    -->

    ## If no refresh frames, print nothing.
    <% if not refresh_frames: return '' %>

    ## Write JavaScript to refresh specified frames.
    <script type="text/javascript">
        config.addInitialization(function(galaxy, config) {
            debugger;
            console.warn("refreshFrames");
            window.bundledEntries.refreshFrames();
        })
    </script>
</%def>
