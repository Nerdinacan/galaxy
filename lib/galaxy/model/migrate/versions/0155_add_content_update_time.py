"""
Adds trigger to dataset table to update history.update_time when
contents are changed.
"""
from __future__ import print_function

import logging

from sqlalchemy import DDL, MetaData

log = logging.getLogger(__name__)
metadata = MetaData()


def upgrade(migrate_engine):
    print(__doc__)
    metadata.bind = migrate_engine
    metadata.reflect()
    # drop_update_trigger(migrate_engine)
    install_update_trigger(migrate_engine)


def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    metadata.reflect()
    drop_update_trigger(migrate_engine)


def install_update_trigger(migrate_engine):
    """Installs trigger on database table to update history table
    when contents have changed. Installs a function and a trigger
    for postgres, other sql variants only require the trigger def
    """

    if migrate_engine.name in ['postgres', 'postgresql']:
        pg_create_trigger = DDL("""
            
            CREATE FUNCTION update_hda_update_time()
                RETURNS trigger
                LANGUAGE 'plpgsql'
            AS $BODY$
            BEGIN
                UPDATE history_dataset_association hda
                SET update_time = current_timestamp
                WHERE hda.dataset_id = NEW.id;
                RETURN NEW;
            END;
            $BODY$;

            CREATE FUNCTION update_history_update_time()
                RETURNS trigger
                LANGUAGE 'plpgsql'
            AS $BODY$
            BEGIN
                UPDATE history h
                SET update_time = current_timestamp
                WHERE h.id = NEW.history_id;
                RETURN NEW;
            END;
            $BODY$;

            CREATE TRIGGER trigger_dataset_aidur
                AFTER INSERT OR DELETE OR UPDATE
                ON dataset
                FOR EACH ROW
                EXECUTE PROCEDURE update_hda_update_time();

            CREATE TRIGGER trigger_dataset_aidur
                AFTER INSERT OR DELETE OR UPDATE
                ON history_dataset_association
                FOR EACH ROW
                EXECUTE PROCEDURE update_history_update_time();
        """)
        pg_create_trigger.execute(bind=migrate_engine)
    else:
        # Looks like sqlite doesn't like multiple actions in some
        # variants, so we build 3 triggers
        build_trigger('INSERT').execute(bind=migrate_engine)
        build_trigger('UPDATE').execute(bind=migrate_engine)
        build_trigger('DELETE').execute(bind=migrate_engine)


def drop_update_trigger(migrate_engine):
    """Drops trigger on dataset table."""

    if migrate_engine.name in ['postgres', 'postgresql']:
        pg_drop_trigger = DDL("""
            DROP TRIGGER IF EXISTS update_hda_update_time ON dataset;
            DROP TRIGGER IF EXISTS update_history_update_time ON history_dataset_association;
            DROP FUNCTION IF EXISTS update_hda_update_time();
            DROP FUNCTION IF EXISTS update_history_update_time();
        """)
        pg_drop_trigger.execute(bind=migrate_engine)
    else:
        build_drop_trigger('INSERT').execute(bind=migrate_engine)
        build_drop_trigger('UPDATE').execute(bind=migrate_engine)
        build_drop_trigger('DELETE').execute(bind=migrate_engine)


def build_trigger(op):
    create_trigger_template = """

        CREATE TRIGGER trigger_dataset_a{op_initial}r
            AFTER {operation}
            ON dataset
            FOR EACH ROW
            BEGIN
                UPDATE history_dataset_association
                SET update_time = current_timestamp
                WHERE dataset_id = {rowset}.id;
            END;

        CREATE TRIGGER trigger_hda_a{op_initial}r
            AFTER {operation}
            ON history_dataset_association
            FOR EACH ROW
            BEGIN
                UPDATE history
                SET update_time = current_timestamp
                WHERE id = {rowset}.history_id;
            END;
    """
    rs = 'OLD' if op == 'DELETE' else 'NEW'
    sql = create_trigger_template.format(operation=op, rowset=rs, op_initial=op.lower()[0])
    return DDL(sql)


def build_drop_trigger(op):
    drop_template = """
        DROP TRIGGER IF EXISTS trigger_dataset_a{op_initial}r;
        DROP TRIGGER IF EXISTS trigger_hda_a{op_initial}r;
    """
    sql = drop_template.format(op_initial=op.lower()[0])
    return DDL(sql)
