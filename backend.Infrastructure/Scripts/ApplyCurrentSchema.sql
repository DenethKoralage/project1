USE [EFCore_test_DB];
GO

DECLARE @sql nvarchar(max);
DECLARE @constraintName sysname;

IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'[dbo].[Users]', N'Workplace') IS NULL
        ALTER TABLE [dbo].[Users] ADD [Workplace] nvarchar(120) NOT NULL CONSTRAINT [DF_Users_Workplace] DEFAULT N'';

    IF COL_LENGTH(N'[dbo].[Users]', N'HomeAddress') IS NULL
        ALTER TABLE [dbo].[Users] ADD [HomeAddress] nvarchar(256) NOT NULL CONSTRAINT [DF_Users_HomeAddress] DEFAULT N'';

    IF COL_LENGTH(N'[dbo].[Users]', N'HomeCity') IS NULL
        ALTER TABLE [dbo].[Users] ADD [HomeCity] nvarchar(120) NOT NULL CONSTRAINT [DF_Users_HomeCity] DEFAULT N'';

    IF COL_LENGTH(N'[dbo].[Users]', N'Country') IS NULL
        ALTER TABLE [dbo].[Users] ADD [Country] nvarchar(120) NOT NULL CONSTRAINT [DF_Users_Country] DEFAULT N'';

    IF COL_LENGTH(N'[dbo].[Users]', N'Currency') IS NULL
        ALTER TABLE [dbo].[Users] ADD [Currency] nvarchar(10) NOT NULL CONSTRAINT [DF_Users_Currency] DEFAULT N'';

    EXEC(N'
        UPDATE [dbo].[Users]
        SET
            [Name] = ISNULL([Name], N''''),
            [Email] = ISNULL([Email], N''''),
            [Password] = ISNULL([Password], N''''),
            [Designation] = ISNULL([Designation], N''''),
            [Workplace] = ISNULL([Workplace], N''''),
            [HomeAddress] = ISNULL([HomeAddress], N''''),
            [HomeCity] = ISNULL([HomeCity], N''''),
            [Country] = ISNULL([Country], N''''),
            [Currency] = ISNULL([Currency], N'''');
    ');

    IF COL_LENGTH(N'[dbo].[Users]', N'AVGIncome') IS NOT NULL
       AND OBJECT_ID(N'[dbo].[Incomes]', N'U') IS NOT NULL
    BEGIN
        EXEC(N'
            INSERT INTO [dbo].[Incomes] ([Id], [Amount], [Category], [Source], [IncomeDate], [Description], [UserId])
            SELECT
                NEWID(),
                CONVERT(decimal(18, 2), [AVGIncome]),
                N''Salary'',
                N''Monthly income'',
                SYSUTCDATETIME(),
                N''Initial income migrated from Users.AVGIncome.'',
                [Id]
            FROM [dbo].[Users] AS [user]
            WHERE [AVGIncome] > 0
              AND NOT EXISTS (
                  SELECT 1
                  FROM [dbo].[Incomes] AS [income]
                  WHERE [income].[UserId] = [user].[Id]
            );
        ');

        SET @constraintName = NULL;
        SELECT @constraintName = [dc].[name]
        FROM [sys].[default_constraints] AS [dc]
        JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
            AND [dc].[parent_column_id] = [c].[column_id]
        WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Users]')
          AND [c].[name] = N'AVGIncome';
        IF @constraintName IS NOT NULL
            EXEC(N'ALTER TABLE [dbo].[Users] DROP CONSTRAINT [' + @constraintName + N']');

        ALTER TABLE [dbo].[Users] DROP COLUMN [AVGIncome];
    END;

    ALTER TABLE [dbo].[Users] ALTER COLUMN [Name] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Email] nvarchar(256) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Password] nvarchar(512) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Designation] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Workplace] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [HomeAddress] nvarchar(256) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [HomeCity] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Country] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [Currency] nvarchar(10) NOT NULL;
END;
GO

DECLARE @constraintName sysname;

IF OBJECT_ID(N'[dbo].[Expenses]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Expenses]
    SET
        [Category] = LEFT(ISNULL([Category], N''), 120),
        [Description] = LEFT(ISNULL([Description], N''), 512);

    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Expenses]')
      AND [c].[name] = N'Amount';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Expenses] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Expenses]')
      AND [c].[name] = N'Category';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Expenses] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Expenses]')
      AND [c].[name] = N'Description';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Expenses] DROP CONSTRAINT [' + @constraintName + N']');

    ALTER TABLE [dbo].[Expenses] ALTER COLUMN [Amount] decimal(18, 2) NOT NULL;
    ALTER TABLE [dbo].[Expenses] ALTER COLUMN [Category] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Expenses] ALTER COLUMN [Description] nvarchar(512) NOT NULL;
END;
GO

DECLARE @constraintName sysname;

IF OBJECT_ID(N'[dbo].[Incomes]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Incomes]
    SET
        [Category] = LEFT(ISNULL([Category], N''), 120),
        [Source] = LEFT(ISNULL([Source], N''), 120),
        [Description] = LEFT(ISNULL([Description], N''), 512);

    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Incomes]')
      AND [c].[name] = N'Amount';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Incomes] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Incomes]')
      AND [c].[name] = N'Category';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Incomes] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Incomes]')
      AND [c].[name] = N'Source';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Incomes] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Incomes]')
      AND [c].[name] = N'Description';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Incomes] DROP CONSTRAINT [' + @constraintName + N']');

    ALTER TABLE [dbo].[Incomes] ALTER COLUMN [Amount] decimal(18, 2) NOT NULL;
    ALTER TABLE [dbo].[Incomes] ALTER COLUMN [Category] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Incomes] ALTER COLUMN [Source] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Incomes] ALTER COLUMN [Description] nvarchar(512) NOT NULL;
END;
GO

DECLARE @constraintName sysname;

IF OBJECT_ID(N'[dbo].[Budgets]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Budgets]
    SET
        [Name] = LEFT(ISNULL([Name], N''), 120),
        [Title] = LEFT(ISNULL([Title], N''), 120),
        [Category] = LEFT(ISNULL([Category], N''), 120),
        [Description] = LEFT(ISNULL([Description], N''), 512);

    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'Amount';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'TotalBudget';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'RemainingBudget';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'Name';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'Title';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'Category';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    SET @constraintName = NULL;
    SELECT @constraintName = [dc].[name]
    FROM [sys].[default_constraints] AS [dc]
    JOIN [sys].[columns] AS [c] ON [dc].[parent_object_id] = [c].[object_id]
        AND [dc].[parent_column_id] = [c].[column_id]
    WHERE [dc].[parent_object_id] = OBJECT_ID(N'[dbo].[Budgets]')
      AND [c].[name] = N'Description';
    IF @constraintName IS NOT NULL
        EXEC(N'ALTER TABLE [dbo].[Budgets] DROP CONSTRAINT [' + @constraintName + N']');

    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [Amount] decimal(18, 2) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [TotalBudget] decimal(18, 2) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [RemainingBudget] decimal(18, 2) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [Name] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [Title] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [Category] nvarchar(120) NOT NULL;
    ALTER TABLE [dbo].[Budgets] ALTER COLUMN [Description] nvarchar(512) NOT NULL;
END;
GO

IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260714044329_UserTableChanges')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260714044329_UserTableChanges', N'10.0.5');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260714050539_UserTableChanges2')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260714050539_UserTableChanges2', N'10.0.5');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260714061802_UserTableChanges3')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260714061802_UserTableChanges3', N'10.0.5');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260714103000_MoveSignupIncomeToIncomes')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260714103000_MoveSignupIncomeToIncomes', N'10.0.5');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260715052000_AlignExpenseTableWithEntity')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260715052000_AlignExpenseTableWithEntity', N'10.0.5');
END;
GO

SELECT
    [c].[name] AS [ColumnName],
    [t].[name] AS [DataType],
    [c].[max_length] AS [MaxLength],
    [c].[precision] AS [Precision],
    [c].[scale] AS [Scale],
    [c].[is_nullable] AS [IsNullable]
FROM [sys].[columns] AS [c]
JOIN [sys].[types] AS [t] ON [c].[user_type_id] = [t].[user_type_id]
WHERE [c].[object_id] = OBJECT_ID(N'[dbo].[Users]')
ORDER BY [c].[column_id];
GO
