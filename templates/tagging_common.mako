<%namespace file="/display_common.mako" import="get_controller_name" />
<%!

from cgi import escape
import six
## from galaxy.model import Tag, ItemTagAssociation
from galaxy.util import unicodify

## Build dict of tag name, values.
def tags_to_dict(item_tags):
    tag_names_and_values = dict()
    for tag in item_tags:
        tag_name = escape( tag.user_tname )
        tag_value = ""
        if tag.value is not None:
            tag_value = escape( tag.user_value )

        ## Tag names and values may be string or unicode object.
        if isinstance( tag_name, six.binary_type ):
            tag_names_and_values[unicodify(tag_name, 'utf-8')] = unicodify(tag_value, 'utf-8')
        else:
            tag_names_and_values[tag_name] = tag_value
    return tag_names_and_values

%>

## Render a tagging element if there is a tagged_item.
%if tagged_item is not None:
    %if tag_type == "individual":
        ${render_individual_tagging_element(
            user=user, 
            tagged_item=tagged_item, 
            elt_context=elt_context, 
            in_form=in_form, 
            tag_click_fn=tag_click_fn, 
            use_toggle_link=use_toggle_link
        )}
    %elif tag_type == "community":
        ${render_community_tagging_element(
            tagged_item=tagged_item, 
            elt_context=elt_context, 
            tag_click_fn=tag_click_fn
        )}
    %endif
%endif


<%def name="render_community_tagging_element(
    tagged_item=None, 
    elt_context=None, 
    use_toggle_link=False, 
    tag_click_fn='default_tag_click_fn')">
    
    <%
        controller_name = get_controller_name(tagged_item)
        click_url = h.url_for( controller='/' + controller_name , action='list_published')
        community_tags = trans.app.tag_handler.get_community_tags( item=tagged_item, limit=5 )
    %>
    
    <div id="tags-community-${controller_name}-${tagged_item.id}"></div>

    <script type="text/javascript">
        config.addInitialization(function(galaxy, config) {
            var container = document.getElementById("tags-community-${controller_name}-${tagged_item.id}");
            var options = ${h.dumps(tagged_item.to_dict())};
            options.url = "${click_url}";
            options.tagClickFn = "${tag_click_fn}";
            options.clickUrl = "${controller_name}";
            bundleEntries.mountCommunityTagsComponent(options, container);
        });
    </script>
</%def>


<%def name="render_individual_tagging_element(
    user=None, 
    tagged_item=None, 
    elt_context=None, 
    use_toggle_link=True, 
    in_form=False, 
    tag_click_fn='default_tag_click_fn', 
    get_toggle_link_text_fn='default_get_toggle_link_text_fn', 
    editable=True, 
    render_add_tag_button=True)">

    <%
        tagged_item_id = str( trans.security.encode_id ( tagged_item.id ) )
        item_tags = [ tag for tag in tagged_item.tags if ( tag.user == user ) ]
    %>

    <div id="tags-${tagged_item_id}"></div>

    <script type="text/javascript">
        config.addInitialization(function(galaxy, config) {
            var container = document.getElementById("tags-${tagged_item_id}");
            var options = {
                id: "${tagged_item_id}",
                tags: ${h.dumps(tags_to_dict(item_tags))},
                itemClass: "${tagged_item.__class__.__name__}",
                context: "${elt_context}"
            };
            bundleEntries.mountTaggingComponent(options, container);
        });
    </script>

</%def>


<%def name="community_tag_js( controller_name )">
## TODO: Note that this function no longer has anything to do with community
## tags. the ratings code and tagging initialization were previously co-mingled
## in here. Will remove this script when we write the ratings components

## set up comminity tag and rating handling - used for page start up / set up
## controller_name: the model controller for the item being tagged - generally gotten with get_controller_name( item )
<script type="text/javascript">

    // Map item rating to number of stars to show.
    function map_rating_to_num_stars(rating) {
        if (rating <= 0)
            return 0;
        else if (rating > 0 && rating <= 1.5)
            return 1;
        else if (rating > 1.5 && rating <= 2.5)
            return 2;
        else if (rating > 2.5 && rating <= 3.5)
            return 3;
        else if (rating > 3.5 && rating <= 4.5)
            return 4;
        else if (rating > 4.5)
            return 5;
    }

    // Init. on document load.
    $(function() {
        // Set links to Galaxy screencasts to open in overlay.
        $(this).find("a[href^='http://screencast.g2.bx.psu.edu/']").each( function() {
            $(this).click( function() {
                var href = $(this).attr('href');
                show_in_overlay(
                    {
                        url: href,
                        width: 640,
                        height: 480,
                        scroll: 'no'
                    }
                );
                return false;
            });
        });

        // Init user item rating.
        $('.user_rating_star').rating({
            callback: function(rating, link) {
                $.ajax({
                    type: "GET",
                    url: "${h.url_for ( controller='/' + controller_name , action='rate_async' )}",
                    data: { id : "${trans.security.encode_id( item.id )}", rating : rating },
                    dataType: 'json',
                    error: function() { alert( "Rating submission failed" ); },
                    success: function( community_data ) {
                        $('#rating_feedback').show();
                        $('#num_ratings').text(Math.round(community_data[1]*10)/10);
                        $('#ave_rating').text(community_data[0]);
                        $('.community_rating_star').rating('readOnly', false);
                        $('.community_rating_star').rating('select', map_rating_to_num_stars(community_data[0])-1);
                        $('.community_rating_star').rating('readOnly', true);
                    }
                });
            },
            required: true // Hide cancel button.
        });
    });
</script>
</%def>
